
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
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

const rateMemeSchema = {
    type: Type.OBJECT,
    properties: {
      viralityScore: {
        type: Type.INTEGER,
        description: "A score from 1 to 100 for the meme's viral potential.",
      },
      critique: {
        type: Type.STRING,
        description: "A short, witty, and sassy critique of the meme, under 25 words.",
      },
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "An array of 2-3 short, actionable suggestions for improving the meme.",
      },
    },
    required: ['viralityScore', 'critique', 'suggestions'],
};

export const rateMeme = async (base64ImageData: string): Promise<MemeRating | null> => {
    if (!isGeminiConfigured) {
        console.warn("Cannot rate meme: AI service not configured.");
        // Return mock data for development/demo purposes
        return Promise.resolve({
            viralityScore: 69,
            critique: "Can't connect to the AI, but this looks like a solid effort!",
            suggestions: ["Share it with your friends!", "Try using a more topical template."]
        });
    }

    const prompt = `You are a world-class meme connoisseur and viral content expert named "Meme Coach". Analyze the provided meme image. Your goal is to rate its potential for virality and provide constructive, humorous feedback. Respond ONLY with a JSON object that matches the provided schema.

- The critique should be witty and a bit sassy.
- The suggestions must be actionable and helpful for making a funnier, more shareable meme.`;
    
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };
        const textPart = {
            text: prompt
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: rateMemeSchema,
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