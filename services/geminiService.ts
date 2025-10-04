
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
// FIX: Import MemeRating type.
import { SuggestedCaption, MemeRating } from "../types";

// As per guidelines, assume API_KEY is always available. The UI can still use this to conditionally render features.
export const isGeminiConfigured = !!process.env.API_KEY;

// As per guidelines, initialize directly and assume API_KEY is present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        top: {
          type: Type.STRING,
          description: 'The text for the top of the meme.',
        },
        bottom: {
          type: Type.STRING,
          description: 'The text for the bottom of the meme.',
        },
      },
      required: ['top', 'bottom'],
    },
};

export const suggestMemeText = async (memeName: string, friendName: string): Promise<SuggestedCaption[]> => {
    if (!isGeminiConfigured) {
        // Return mock data if API key is not available, to avoid breaking the UI for users without a key.
        return Promise.resolve([
            { top: `When you see the weekend coming`, bottom: `It's beautiful` },
            { top: `Me explaining my brilliant idea`, bottom: `My friend ${friendName || '[FRIEND_NAME]'} pretending to understand` },
            { top: `That feeling`, bottom: `When the code compiles on the first try` },
        ]);
    }

    const prompt = `Generate 5 short, witty, and viral meme captions for an image titled '${memeName}'. 
The captions should be split into a top text and a bottom text. 
If a friend's name placeholder '[FRIEND_NAME]' is provided, one of the captions MUST include it. The placeholder is: '${friendName}'.
The text should be funny and relatable.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const jsonStr = response.text.trim();
        const suggestions: SuggestedCaption[] = JSON.parse(jsonStr);
        return suggestions;

    } catch (error) {
        console.error("Error calling Gemini API for text:", error);
        // Fallback to mock data on error
        return [
            { top: `Error generating text`, bottom: `Please try again later` },
            { top: `My face when the AI is down`, bottom: `At least I have ${friendName || 'a friend'}` },
        ];
    }
};

export const generateMemeImage = async (prompt: string): Promise<string | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot generate image: AI service not configured.");
        return null;
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A funny, high-quality meme image of: ${prompt}. Photo-realistic, vibrant, and clear.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        return null;
    }
};

export const editMemeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot edit image: AI service not configured.");
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        console.warn("AI did not return an image for the edit prompt.");
        return null;

    } catch (error) {
        console.error("Error calling Gemini API for image editing:", error);
        return null;
    }
};

// FIX: Add rateMeme function to provide AI-powered meme analysis.
const memeRatingSchema = {
    type: Type.OBJECT,
    properties: {
        viralityScore: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 indicating the meme's viral potential. 0 is not funny, 100 is a viral masterpiece."
        },
        critique: {
            type: Type.STRING,
            description: "A short, constructive critique of the meme. Be witty and act like a professional meme critic."
        },
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "An array of 2-3 specific, actionable suggestions to improve the meme's humor or relatability."
        }
    },
    required: ['viralityScore', 'critique', 'suggestions']
};

export const rateMeme = async (imageBase64: string): Promise<MemeRating | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot rate meme: AI service not configured.");
        return null;
    }

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg', // The model is robust enough to handle various image types passed as jpeg.
            data: imageBase64,
        },
    };
    
    const systemInstruction = `You are a world-class meme expert and critic named "Meme Coach". Your job is to rate user-submitted memes and provide constructive feedback. Analyze this meme image for its humor, relatability, and viral potential. The viralityScore must be between 0 and 100. Be honest and critical; do not give high scores easily. The critique should be a short, witty, and insightful paragraph. Provide 2-3 specific, actionable suggestions for improvement. These could be about the caption, the image itself, or the concept. Return your response in the specified JSON format.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: memeRatingSchema,
                temperature: 0.7,
            },
        });

        const jsonStr = response.text.trim();
        const rating: MemeRating = JSON.parse(jsonStr);
        return rating;

    } catch (error) {
        console.error("Error calling Gemini API for meme rating:", error);
        return null;
    }
};

export const generateMemeVideo = async (prompt: string): Promise<any | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot generate video: AI service not configured.");
        return null;
    }

    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `A funny, high-quality meme video of: ${prompt}.`,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error calling Gemini API for video generation:", error);
        return null;
    }
};

export const getVideoOperationStatus = async (operation: any): Promise<any | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot check video status: AI service not configured.");
        return null;
    }
    try {
        return await ai.operations.getVideosOperation({ operation });
    } catch (error) {
        console.error("Error checking video operation status:", error);
        return null;
    }
}