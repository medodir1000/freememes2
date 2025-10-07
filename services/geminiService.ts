import { SuggestedCaption, MemeRating } from "../types";

// Helper to handle API requests to our own backend
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || 'Failed to fetch from API.');
    }
    return response;
};

// This function can be used by components to check if the backend has the AI key.
export const checkAiServiceStatus = async (): Promise<boolean> => {
    try {
        const response = await apiRequest('/status');
        const data = await response.json();
        if(!data.configured) {
             console.warn("Backend reports that the GEMINI_API_KEY is not configured. AI features will be disabled.");
        }
        return data.configured;
    } catch (error) {
        console.error("Could not connect to the backend to check AI service status.", error);
        return false;
    }
};

export const suggestMemeText = async (memeName: string, friendName: string): Promise<SuggestedCaption[]> => {
    try {
        const response = await apiRequest('/suggest-text', {
            method: 'POST',
            body: JSON.stringify({ memeName, friendName }),
        });
        const jsonStr = await response.text();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error fetching AI text suggestions:", error);
        // Fallback to mock data on error
        return [
            { top: `Error generating text`, bottom: `Please try again later` },
            { top: `My face when the AI is down`, bottom: `At least I have ${friendName || 'a friend'}` },
        ];
    }
};

export const generateMemeImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await apiRequest('/generate-image', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        return data.imageBytes;
    } catch (error) {
        console.error("Error generating AI image:", error);
        return null;
    }
};

export const editMemeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
     try {
        const response = await apiRequest('/edit-image', {
            method: 'POST',
            body: JSON.stringify({ base64ImageData, mimeType, prompt }),
        });
        const data = await response.json();
        return data.imageBytes;
    } catch (error) {
        console.error("Error editing AI image:", error);
        return null;
    }
};

export const rateMeme = async (imageBase64: string): Promise<MemeRating | null> => {
    try {
        const response = await apiRequest('/rate-meme', {
            method: 'POST',
            body: JSON.stringify({ imageBase64 }),
        });
        const jsonStr = await response.text();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error rating meme with AI:", error);
        return null;
    }
};

export const generateMemeVideo = async (prompt: string): Promise<any | null> => {
    try {
        const response = await apiRequest('/generate-video', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        });
        return response.json();
    } catch (error) {
        console.error("Error generating AI video:", error);
        return null;
    }
};

export const getVideoOperationStatus = async (operation: any): Promise<any | null> => {
    try {
        const response = await apiRequest('/video-status', {
            method: 'POST',
            body: JSON.stringify({ operation }),
        });
        return response.json();
    } catch (error) {
        console.error("Error checking video operation status:", error);
        return null;
    }
};
