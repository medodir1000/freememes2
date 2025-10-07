import { supabase } from '../lib/supabaseClient';
import { Meme, User, Winner, Comment } from '../types';

const RLS_ERROR_MESSAGE = "Database access error: Please check your Row Level Security (RLS) policies in Supabase and ensure read access is enabled for the public 'anon' role.";
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || '';

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
    const mediaType = meme.image_url && meme.image_url.includes('.mp4') ? 'video' : 'image';
    
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