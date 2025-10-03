
export interface MemeTemplate {
    id: string;
    name: string;
    url: string;
    width: number;
    height: number;
    box_count: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    totalVotes: number;
    memesCreated: number;
    badge?: string | null;
}

export interface Meme {
    id: string;
    templateId: string | null;
    imageUrl: string;
    mediaType: 'image' | 'video';
    creator: { id: string; name: string; avatarUrl: string | null; };
    votes: number;
    comments: Comment[];
    createdAt: string;
    topText?: string | null;
    bottomText?: string | null;
}

export interface Comment {
    id: string;
    author: { id: string; name: string; avatarUrl: string | null; };
    text: string;
    createdAt: string;
}

export interface Winner {
    id: string;
    name: string;
    avatar_url: string; // Keep snake_case for direct mapping from DB
    month: string;
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
}

export interface SuggestedCaption {
    top: string;
    bottom: string;
}

export interface MemeRating {
    viralityScore: number;
    critique: string;
    suggestions: string[];
}
