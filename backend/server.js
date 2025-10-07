import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI, Type, Modality } from '@google/genai';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Increase limit to handle base64 image data
app.use(express.json({ limit: '10mb' }));

// Securely get API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
let ai;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.log('Gemini AI client initialized successfully.');
} else {
  console.error('FATAL ERROR: GEMINI_API_KEY environment variable is not set.');
}

// Simple status endpoint for the frontend to check if AI is configured
app.get('/api/status', (req, res) => {
  res.json({ configured: !!apiKey });
});

// Generic error handler for AI endpoints
const handleAiError = (res, error, operation) => {
    console.error(`Error during AI operation '${operation}':`, error);
    res.status(500).json({ error: `An error occurred during ${operation}. Please check the backend logs.` });
};

// Endpoint to suggest meme text
app.post('/api/suggest-text', async (req, res) => {
  if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
  
  const { memeName, friendName } = req.body;
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
        responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { top: { type: Type.STRING }, bottom: { type: Type.STRING } },
              required: ['top', 'bottom'],
            },
        },
        temperature: 0.8,
      },
    });
    res.send(response.text);
  } catch (error) {
    handleAiError(res, error, 'text suggestion');
  }
});

// Endpoint to generate an image
app.post('/api/generate-image', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A funny, high-quality meme image of: ${prompt}. Photo-realistic, vibrant, and clear.`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });
        res.json({ imageBytes: response.generatedImages[0].image.imageBytes });
    } catch (error) {
        handleAiError(res, error, 'image generation');
    }
});

// Endpoint to edit an image
app.post('/api/edit-image', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
    const { base64ImageData, mimeType, prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
        res.json({ imageBytes: imagePart ? imagePart.inlineData.data : null });
    } catch (error) {
        handleAiError(res, error, 'image editing');
    }
});

// Endpoint to rate a meme
app.post('/api/rate-meme', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
    const { imageBase64 } = req.body;
    const systemInstruction = `You are a world-class meme expert and critic named "Meme Coach". Your job is to rate user-submitted memes and provide constructive feedback. Analyze this meme image for its humor, relatability, and viral potential. The viralityScore must be between 0 and 100. Be honest and critical; do not give high scores easily. The critique should be a short, witty, and insightful paragraph. Provide 2-3 specific, actionable suggestions for improvement. These could be about the caption, the image itself, or the concept. Return your response in the specified JSON format.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        viralityScore: { type: Type.INTEGER },
                        critique: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['viralityScore', 'critique', 'suggestions']
                },
                temperature: 0.7,
            },
        });
        res.send(response.text);
    } catch (error) {
        handleAiError(res, error, 'meme rating');
    }
});

// Endpoint to generate a video
app.post('/api/generate-video', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
    const { prompt } = req.body;
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `A funny, high-quality meme video of: ${prompt}.`,
            config: { numberOfVideos: 1 }
        });
        res.json(operation);
    } catch (error) {
        handleAiError(res, error, 'video generation');
    }
});

// Endpoint to check video status
app.post('/api/video-status', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured.' });
    const { operation } = req.body;
    try {
        const status = await ai.operations.getVideosOperation({ operation });
        res.json(status);
    } catch (error) {
        handleAiError(res, error, 'video status check');
    }
});

// Endpoint to securely fetch the generated video
app.get('/api/get-video', async (req, res) => {
    if (!apiKey) return res.status(503).json({ error: 'AI service is not configured.' });
    const { uri } = req.query;
    if (!uri) return res.status(400).json({ error: 'Missing video URI' });

    try {
        const videoUrl = `${uri}&key=${apiKey}`;
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video from Gemini. Status: ${videoResponse.status}`);
        }
        // Pipe the video stream directly to the client
        videoResponse.body.pipe(res);
    } catch (error) {
        handleAiError(res, error, 'video fetching');
    }
});


app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
