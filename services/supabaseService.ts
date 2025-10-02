
import { supabase } from '../lib/supabaseClient';
import { Meme, User, Winner, Comment } from '../types';

const RLS_ERROR_MESSAGE = "Database access error: Please check your Row Level Security (RLS) policies in Supabase and ensure read access is enabled for the public 'anon' role.";

const handleSupabaseError = (error: any) => {
    if (error && typeof error.message === 'string' && error.message.includes('Could not find the table')) {
        throw new Error(RLS_ERROR_MESSAGE);
    }
    console.error('Error fetching data:', error.message);
    throw error;
};

const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    totalVotes: Number(profile.total_votes) || 0,
    memesCreated: Number(profile.memes_created) || 0,
    badge: profile.badge,
});

const mapToMeme = (meme: any): Meme => ({
    id: meme.id,
    imageUrl: meme.image_url,
    topText: meme.top_text,
    bottomText: meme.bottom_text,
    mediaType: meme.image_url && meme.image_url.includes('.mp4') ? 'video' : 'image',
    votes: Number(meme.votes) || 0,
    createdAt: meme.created_at,
    templateId: meme.template_id,
    creator: meme.profiles ? {
        id: meme.profiles.id,
        name: meme.profiles.name,
        avatarUrl: meme.profiles.avatar_url,
    } : {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Unknown Creator',
        avatarUrl: null,
    },
    comments: [],
});

const mapToComment = (comment: any): Comment => ({
    id: comment.id,
    text: comment.text,
    createdAt: comment.created_at,
    author: comment.profiles ? {
        id: comment.profiles.id,
        name: comment.profiles.name,
        avatarUrl: comment.profiles.avatar_url,
    } : {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Unknown User',
        avatarUrl: null
    },
});

/**
 * Converts a base64 data URL into a Blob.
 * @param dataurl The data URL string.
 * @returns A Blob object.
 */
const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL format');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};


export const getMemes = async (filter: string): Promise<Meme[]> => {
    let query = supabase
        .from('memes')
        .select(`
            id, image_url, top_text, bottom_text, votes, created_at, template_id,
            profiles (id, name, avatar_url)
        `)
        .limit(20);

    switch (filter) {
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        case 'this-week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query = query.gt('created_at', oneWeekAgo.toISOString()).order('votes', { ascending: false });
            break;
        case 'trending':
        default:
            query = query.order('votes', { ascending: false });
            break;
    }

    const { data, error } = await query;
    if (error) {
        handleSupabaseError(error);
    }
    if (!data) return [];
    
    const memes: Meme[] = [];
    for (const record of data) {
        try {
            memes.push(mapToMeme(record));
        } catch (e) {
            console.error('Failed to process meme record:', record, e);
        }
    }
    return memes;
};

export const getLeaderboard = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_votes', { ascending: false })
        .limit(100);
        
    if (error) {
        handleSupabaseError(error);
    }
    if (!data) return [];

    const users: User[] = [];
    for (const profile of data) {
        try {
            users.push(mapProfileToUser(profile));
        } catch (e) {
            console.error('Failed to process profile record:', profile, e);
        }
    }
    return users;
};

export const getWinners = async (): Promise<Winner[]> => {
    const { data, error } = await supabase.from('winners').select('*').order('created_at', { ascending: false });
    if (error) {
        handleSupabaseError(error);
    }
    return data || [];
};

export const publishMeme = async (memeData: { userId: string, imageUrl: string, templateId: string | null, topText?: string, bottomText?: string }): Promise<void> => {
    // 1. Convert base64 image (from canvas) to a file blob
    const imageBlob = dataURLtoBlob(memeData.imageUrl);
    const fileName = `public/${memeData.userId}/${Date.now()}.jpeg`;

    // 2. Upload to Supabase Storage in the 'memes-images' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes-images')
        .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
            upsert: false,
        });
        
    if (uploadError) {
        console.error("Error uploading meme image to storage:", uploadError);
        throw new Error('Failed to upload meme image.');
    }

    // 3. Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
        .from('memes-images')
        .getPublicUrl(uploadData.path);

    // 4. Insert meme metadata into the database with the public URL
    const { error: insertError } = await supabase.from('memes').insert({
        user_id: memeData.userId,
        image_url: urlData.publicUrl, // Store the public URL
        template_id: memeData.templateId,
        top_text: memeData.topText,
        bottom_text: memeData.bottomText,
    });

    if (insertError) {
        console.error("Error inserting meme metadata:", insertError);
        // Clean up the orphaned file in storage if DB insert fails
        await supabase.storage.from('memes-images').remove([fileName]);
        throw insertError;
    }

    // 5. Increment the user's meme count
    const { error: rpcError } = await supabase.rpc('increment_memes_created', { user_id_param: memeData.userId });
    if (rpcError) console.error("Failed to increment memes_created count:", rpcError);
};

export const getCommentsForMeme = async (memeId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            id, text, created_at,
            profiles (id, name, avatar_url)
        `)
        .eq('meme_id', memeId)
        .order('created_at', { ascending: false });

    if (error) {
        handleSupabaseError(error);
    }
    if (!data) return [];

    const comments: Comment[] = [];
    for (const record of data) {
        try {
            comments.push(mapToComment(record));
        } catch (e) {
            console.error('Failed to process comment record:', record, e);
        }
    }
    return comments;
};

export const addComment = async (memeId: string, userId: string, text: string): Promise<Comment | null> => {
    const { data, error } = await supabase
        .from('comments')
        .insert({ meme_id: memeId, user_id: userId, text })
        .select(`
            id, text, created_at,
            profiles (id, name, avatar_url)
        `)
        .single();
        
    if (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
    if (!data) return null;

    try {
        return mapToComment(data);
    } catch(e) {
        console.error('Failed to process new comment record:', data, e);
        return null;
    }
};

export const castVote = async (memeId: string, userId: string, voteValue: 1 | -1): Promise<{ newTotalVotes: number | null; milestoneMessage: string | null }> => {
    const { data, error } = await supabase.rpc('cast_vote', {
        meme_id_param: memeId,
        user_id_param: userId,
        vote_value_param: voteValue
    });

    if (error) {
        console.error("Error casting vote:", error);
        throw error;
    }
    
    // Add a check to prevent crash if RPC returns no data or unexpected types
    if (!data) {
        console.error("No data returned from cast_vote RPC call.");
        return { newTotalVotes: null, milestoneMessage: null };
    }

    const newTotalVotes = data.new_total_votes;
    const milestoneMessage = data.milestone_message;

    return {
        newTotalVotes: typeof newTotalVotes === 'number' ? newTotalVotes : null,
        milestoneMessage: typeof milestoneMessage === 'string' ? milestoneMessage : null
    };
};

export const publishVideoMeme = async (memeData: { userId: string, videoUrl: string, topText?: string, bottomText?: string }): Promise<void> => {
    // 1. Fetch the video from the Gemini URL with the API key
    const videoResponse = await fetch(`${memeData.videoUrl}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error('Failed to download generated video.');
    }
    const videoBlob = await videoResponse.blob();
    const fileName = `public/${memeData.userId}/${Date.now()}.mp4`;

    // 2. Upload video to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes-images') // Re-using same bucket
        .upload(fileName, videoBlob, {
            contentType: 'video/mp4',
            upsert: false,
        });

    if (uploadError) {
        console.error("Error uploading meme video to storage:", uploadError);
        throw new Error('Failed to upload meme video.');
    }

    // 3. Get the public URL
    const { data: urlData } = supabase.storage
        .from('memes-images')
        .getPublicUrl(uploadData.path);
    
    // 4. Insert metadata into DB
    const { error: insertError } = await supabase.from('memes').insert({
        user_id: memeData.userId,
        image_url: urlData.publicUrl,
        top_text: memeData.topText,
        bottom_text: memeData.bottomText,
    });

    if (insertError) {
        console.error("Error inserting video meme metadata:", insertError);
        await supabase.storage.from('memes-images').remove([fileName]);
        throw insertError;
    }

    // 5. Increment user's meme count
    const { error: rpcError } = await supabase.rpc('increment_memes_created', { user_id_param: memeData.userId });
    if (rpcError) console.error("Failed to increment memes_created count:", rpcError);
};

export const getMemeById = async (id: string): Promise<Meme | null> => {
    const { data, error } = await supabase
        .from('memes')
        .select(`
            id, image_url, top_text, bottom_text, votes, created_at, template_id,
            profiles (id, name, avatar_url)
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        // PostgREST error code for "exactly one row was expected" but 0 were found.
        // This is a normal "not found" case.
        if (error.code === 'PGRST116') { 
            console.warn(`Meme with id ${id} not found.`);
            return null;
        }
        handleSupabaseError(error);
    }

    if (!data) return null;

    try {
        return mapToMeme(data);
    } catch (e) {
        console.error('Failed to process meme record:', data, e);
        return null;
    }
};
