import { supabase } from '../lib/supabaseClient';
import { Meme, User, Winner, Comment } from '../types';

const RLS_ERROR_MESSAGE = "Database access error: Please check your Row Level Security (RLS) policies in Supabase and ensure read access is enabled for the public 'anon' role.";
// FIX: Use process.env, which is replaced by Vite's `define` config, to avoid issues with `import.meta.env`.
const API_BASE_URL = process.env.VITE_BACKEND_API_URL || '';

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

const mapToMeme = (meme: any): Meme => {
    let imageUrl = meme.image_url;
    const mediaType = meme.image_url && (meme.image_url.includes('.mp4') || meme.image_url.includes('videotool.veo.g.co')) ? 'video' : 'image';
    
    // Only apply image transformations to images, not videos, and only to our Supabase storage URLs
    if (mediaType === 'image' && imageUrl && imageUrl.startsWith('https://swpynrjlochokyqxqeoz.supabase.co/storage/v1/object/public/memes-images/')) {
        imageUrl += '?width=600&quality=80';
    }

    return {
        id: meme.id,
        imageUrl: imageUrl, // Use the potentially optimized URL
        topText: meme.top_text,
        bottomText: meme.bottom_text,
        mediaType: mediaType,
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
    };
};

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
        case 'trending':
            query = query.order('votes', { ascending: false });
            break;
        case 'this-week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query = query
                .filter('created_at', 'gte', oneWeekAgo.toISOString())
                .order('votes', { ascending: false });
            break;
        default:
            query = query.order('votes', { ascending: false }); // Default to trending
            break;
    }

    try {
        const { data, error } = await query;
        if (error) handleSupabaseError(error);
        return data ? data.map(mapToMeme) : [];
    } catch (error) {
        handleSupabaseError(error);
        return [];
    }
};

export const getMemeById = async (id: string): Promise<Meme | null> => {
    try {
        const { data, error } = await supabase
            .from('memes')
            .select(`
                id, image_url, top_text, bottom_text, votes, created_at, template_id,
                profiles (id, name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) handleSupabaseError(error);
        return data ? mapToMeme(data) : null;
    } catch (error) {
        handleSupabaseError(error);
        return null;
    }
};

export const getLeaderboard = async (): Promise<User[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('total_votes', { ascending: false })
            .limit(100);
        
        if (error) handleSupabaseError(error);
        return data ? data.map(mapProfileToUser) : [];
    } catch (error) {
        handleSupabaseError(error);
        return [];
    }
};

export const getWinners = async (): Promise<Winner[]> => {
    try {
        const { data, error } = await supabase
            .from('winners')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) handleSupabaseError(error);
        return data || [];
    } catch (error) {
        handleSupabaseError(error);
        return [];
    }
};

export const getCommentsForMeme = async (memeId: string): Promise<Comment[]> => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                id, text, created_at,
                profiles (id, name, avatar_url)
            `)
            .eq('meme_id', memeId)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error);
        return data ? data.map(mapToComment) : [];
    } catch (error) {
        handleSupabaseError(error);
        return [];
    }
};

export const addComment = async (memeId: string, userId: string, text: string): Promise<Comment | null> => {
    try {
        const { data: insertedData, error: insertError } = await supabase
            .from('comments')
            .insert({ meme_id: memeId, user_id: userId, text: text })
            .select()
            .single();

        if (insertError) handleSupabaseError(insertError);

        if (insertedData) {
            const { data: commentWithProfile, error: fetchError } = await supabase
                .from('comments')
                .select(`
                    id, text, created_at,
                    profiles (id, name, avatar_url)
                `)
                .eq('id', insertedData.id)
                .single();
            
            if (fetchError) handleSupabaseError(fetchError);
            return commentWithProfile ? mapToComment(commentWithProfile) : null;
        }
        return null;
    } catch (error) {
        handleSupabaseError(error);
        return null;
    }
};

export const castVote = async (memeId: string, userId: string, voteValue: 1 | -1): Promise<{ newTotalVotes: number | null, milestoneMessage: string | null }> => {
    try {
        const { data, error } = await supabase.rpc('cast_vote', {
            meme_id_param: memeId,
            user_id_param: userId,
            vote_value_param: voteValue
        });

        if (error) handleSupabaseError(error);

        return {
            newTotalVotes: data?.new_total_votes ?? null,
            milestoneMessage: data?.milestone_message ?? null,
        };
    } catch (error) {
        handleSupabaseError(error);
        return { newTotalVotes: null, milestoneMessage: null };
    }
};

interface MemeToPublish {
    userId: string;
    templateId: string | null;
    imageUrl: string;
    topText: string | null;
    bottomText: string | null;
}

export const publishMeme = async (memeData: MemeToPublish): Promise<Meme> => {
    try {
        const { userId, templateId, imageUrl, topText, bottomText } = memeData;
        
        const blob = dataURLtoBlob(imageUrl);
        const fileName = `${userId}/${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('memes-images')
            .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
            .storage
            .from('memes-images')
            .getPublicUrl(uploadData.path);
            
        const { data: meme, error: insertError } = await supabase
            .from('memes')
            .insert({
                user_id: userId,
                template_id: templateId,
                image_url: publicUrl,
                top_text: topText,
                bottom_text: bottomText,
            })
            .select()
            .single();

        if (insertError) throw insertError;
        if (!meme) throw new Error("Meme creation failed in database.");

        await supabase.rpc('increment_memes_created', { user_id_param: userId });

        const { data: newMeme, error: fetchError } = await supabase
            .from('memes')
            .select(`
                id, image_url, top_text, bottom_text, votes, created_at, template_id,
                profiles (id, name, avatar_url)
            `)
            .eq('id', meme.id)
            .single();
        
        if (fetchError) throw fetchError;
        if (!newMeme) throw new Error("Could not fetch newly created meme.");

        return mapToMeme(newMeme);
    } catch (error) {
        handleSupabaseError(error);
        throw new Error("Failed to publish meme.");
    }
};

interface VideoMemeToPublish {
    userId: string;
    videoUrl: string;
    topText: string | null;
    bottomText: string | null;
}

export const publishVideoMeme = async (memeData: VideoMemeToPublish): Promise<Meme> => {
    try {
        const { userId, videoUrl, topText, bottomText } = memeData;

        const response = await fetch(`${API_BASE_URL}/api/get-video?uri=${encodeURIComponent(videoUrl)}`);
        if (!response.ok) {
            throw new Error('Failed to download generated video for publishing.');
        }
        const videoBlob = await response.blob();
        
        const fileName = `${userId}/${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('memes-images') 
            .upload(fileName, videoBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'video/mp4'
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
            .storage
            .from('memes-images')
            .getPublicUrl(uploadData.path);

        const { data: meme, error: insertError } = await supabase
            .from('memes')
            .insert({
                user_id: userId,
                image_url: publicUrl,
                top_text: topText,
                bottom_text: bottomText,
            })
            .select()
            .single();

        if (insertError) throw insertError;
        if (!meme) throw new Error("Video meme creation failed in database.");
        
        await supabase.rpc('increment_memes_created', { user_id_param: userId });
        
        const { data: newMeme, error: fetchError } = await supabase
            .from('memes')
            .select(`
                id, image_url, top_text, bottom_text, votes, created_at, template_id,
                profiles (id, name, avatar_url)
            `)
            .eq('id', meme.id)
            .single();

        if (fetchError) throw fetchError;
        if (!newMeme) throw new Error("Could not fetch newly created video meme.");

        return mapToMeme(newMeme);
    } catch (error) {
        handleSupabaseError(error);
        throw new Error("Failed to publish video meme.");
    }
};