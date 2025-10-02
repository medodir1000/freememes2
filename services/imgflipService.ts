
import { MemeTemplate } from '../types';

const API_URL = 'https://api.imgflip.com/get_memes';

export const getMemeTemplates = async (): Promise<MemeTemplate[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch meme templates');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error_message || 'API returned an error');
        }
        return data.data.memes;
    } catch (error) {
        console.error("Error fetching from Imgflip API:", error);
        return [];
    }
};
