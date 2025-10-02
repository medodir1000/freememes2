import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMemeTemplates } from '../services/imgflipService';
import { suggestMemeText, generateMemeImage, isGeminiConfigured, editMemeImage, generateMemeVideo, getVideoOperationStatus } from '../services/geminiService';
import { publishMeme as dbPublishMeme, publishVideoMeme as dbPublishVideoMeme } from '../services/supabaseService';
import { MemeTemplate } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CreateMemePageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

type Mode = 'template' | 'upload' | 'ai' | 'video';

const CreateMemePage: React.FC<CreateMemePageProps> = ({ showNotification }) => {
    const [mode, setMode] = useState<Mode>('template');
    const [templates, setTemplates] = useState<MemeTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<MemeTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; id?: string } | null>(null);

    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [friendName, setFriendName] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [remixPrompt, setRemixPrompt] = useState('');
    const [aiVideoPrompt, setAiVideoPrompt] = useState('');

    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isRemixing, setIsRemixing] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pollIntervalRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (!isAuthLoading && !user) {
            showNotification('Please sign in to create a meme.', 'info');
            navigate('/signin');
        }
    }, [user, isAuthLoading, navigate, showNotification]);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoadingTemplates(true);
            try {
                const fetchedTemplates = await getMemeTemplates();
                setTemplates(fetchedTemplates);
                setFilteredTemplates(fetchedTemplates);
            } catch (error) {
                showNotification('Could not fetch meme templates.', 'error');
            } finally {
                setIsLoadingTemplates(false);
            }
        };

        if (mode === 'template') {
            fetchTemplates();
        }
    }, [mode, showNotification]);

    useEffect(() => {
        const results = templates.filter(template =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTemplates(results);
    }, [searchTerm, templates]);
    
    const drawMeme = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !selectedImage) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImage.url;
        img.onload = () => {
            canvas!.width = img.width;
            canvas!.height = img.height;
            ctx.clearRect(0, 0, canvas!.width, canvas!.height);
            ctx.drawImage(img, 0, 0);

            // Draw Meme Text
            const fontSize = canvas!.width / 10;
            ctx.font = `bold ${fontSize}px Impact`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize / 20;
            ctx.textAlign = 'center';

            ctx.textBaseline = 'top';
            const topY = canvas!.height * 0.05;
            ctx.strokeText(topText.toUpperCase(), canvas!.width / 2, topY);
            ctx.fillText(topText.toUpperCase(), canvas!.width / 2, topY);

            ctx.textBaseline = 'bottom';
            const bottomY = canvas!.height * 0.95;
            ctx.strokeText(bottomText.toUpperCase(), canvas!.width / 2, bottomY);
            ctx.fillText(bottomText.toUpperCase(), canvas!.width / 2, bottomY);

            // Draw Watermark
            const watermarkFontSize = canvas!.width / 35;
            ctx.font = `bold ${watermarkFontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            const padding = canvas!.width * 0.02;
            ctx.fillText('freememesgenerator.com', canvas!.width - padding, canvas!.height - padding);
        };
        img.onerror = () => {
            showNotification('Could not load the selected image for editing.', 'error');
        }

    }, [selectedImage, topText, bottomText, showNotification]);

    useEffect(() => {
        if (selectedImage && canvasRef.current) {
            drawMeme();
        }
    }, [selectedImage, topText, bottomText, drawMeme]);

    // Stop polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const handleGetSuggestions = async () => {
        if (!selectedImage) return;
        setIsLoadingSuggestions(true);
        try {
            const suggestions = await suggestMemeText(selectedImage.name, friendName);
            if (suggestions && suggestions.length > 0) {
                setTopText(suggestions[0].top);
                setBottomText(suggestions[0].bottom);
                showNotification('AI suggestions applied!', 'info');
            } else {
                showNotification('Could not get AI suggestions.', 'error');
            }
        } catch (error) {
            showNotification('Error getting suggestions from AI.', 'error');
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    
    const handleGenerateImage = async () => {
        if (!aiPrompt.trim()) {
            showNotification('Please enter a prompt for the image.', 'info');
            return;
        }
        setIsLoadingImage(true);
        try {
            const imageBytes = await generateMemeImage(aiPrompt);
            if (imageBytes) {
                setSelectedImage({ url: `data:image/jpeg;base64,${imageBytes}`, name: aiPrompt });
                showNotification('Image generated successfully!', 'success');
            } else {
                showNotification('Failed to generate image. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('An error occurred while generating the image.', 'error');
        } finally {
            setIsLoadingImage(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!aiVideoPrompt.trim()) {
            showNotification('Please enter a prompt for the video.', 'info');
            return;
        }
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        setIsVideoGenerating(true);
        setVideoGenerationStatus('Sending request to AI...');
        setGeneratedVideoUrl(null);

        try {
            let operation = await generateMemeVideo(aiVideoPrompt);
            if (!operation) {
                throw new Error('Failed to start video generation.');
            }

            setVideoGenerationStatus('Video generation started. This may take a few minutes. Checking progress...');

            pollIntervalRef.current = window.setInterval(async () => {
                operation = await getVideoOperationStatus(operation);
                if (operation?.done) {
                    clearInterval(pollIntervalRef.current!);
                    pollIntervalRef.current = null;
                    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setGeneratedVideoUrl(downloadLink);
                        setIsVideoGenerating(false);
                        setVideoGenerationStatus('Video ready!');
                        showNotification('Your video has been generated!', 'success');
                    } else {
                        throw new Error('Video generation finished but no video URL was found.');
                    }
                } else {
                    console.log('Video generation in progress...');
                    setVideoGenerationStatus('Still working on it... please wait.');
                }
            }, 10000); // Poll every 10 seconds

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            showNotification(message, 'error');
            setIsVideoGenerating(false);
            setVideoGenerationStatus('');
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        }
    };

    const handleRemixImage = async () => {
        if (!remixPrompt.trim()) {
            showNotification('Please enter a remix instruction.', 'info');
            return;
        }
        if (!selectedImage) {
            showNotification('Select an image before remixing.', 'error');
            return;
        }

        setIsRemixing(true);

        const getBase64FromUrl = (url: string): Promise<{ base64: string; mimeType: string }> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg'); 
                    const mimeType = 'image/jpeg';
                    const base64 = dataUrl.split(',')[1];
                    resolve({ base64, mimeType });
                };
                img.onerror = (err) => reject(err);
                img.src = url;
            });
        };

        try {
            const { base64: currentImageBase64, mimeType } = await getBase64FromUrl(selectedImage.url);
            
            const editedImageBase64 = await editMemeImage(currentImageBase64, mimeType, remixPrompt);

            if (editedImageBase64) {
                setSelectedImage({
                    ...selectedImage,
                    url: `data:image/jpeg;base64,${editedImageBase64}`,
                    name: `${selectedImage.name} (AI Remix)`,
                });
                showNotification('Image remixed successfully!', 'success');
                setRemixPrompt('');
            } else {
                showNotification('Failed to remix image. The AI might not have understood.', 'error');
            }
        } catch (error) {
            console.error("Error during image remix:", error);
             if (error instanceof DOMException && error.name === 'SecurityError') {
                showNotification('Cannot remix this template due to image restrictions. Try uploading an image.', 'error');
            } else {
                showNotification('An error occurred while preparing the image for remixing.', 'error');
            }
        } finally {
            setIsRemixing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setSelectedImage({ url: event.target.result, name: file.name });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearText = () => {
        setTopText('');
        setBottomText('');
        showNotification('Text fields cleared', 'info');
    };
    
    const handlePublish = async () => {
        const canvas = canvasRef.current;
        if (!selectedImage || !canvas) {
            showNotification('Please select an image and add text.', 'error');
            return;
        }
        if (!user) {
            showNotification('You must be logged in to publish.', 'error');
            return;
        }

        setIsPublishing(true);
        try {
            const imageUrl = canvas.toDataURL('image/jpeg', 0.9);

            await dbPublishMeme({
                templateId: (mode === 'template' && selectedImage.id) ? selectedImage.id : null,
                imageUrl: imageUrl,
                topText,
                bottomText,
                userId: user.id
            });
            showNotification('Your masterpiece has been published!', 'success');
            navigate('/feed/newest');
        } catch (error) {
            showNotification('Failed to publish meme. Please try again.', 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePublishVideo = async () => {
        if (!generatedVideoUrl) {
            showNotification('No video has been generated.', 'error');
            return;
        }
        if (!user) {
            showNotification('You must be logged in to publish.', 'error');
            return;
        }

        setIsPublishing(true);
        try {
            await dbPublishVideoMeme({
                userId: user.id,
                videoUrl: generatedVideoUrl,
                topText,
                bottomText,
            });
            showNotification('Your video meme has been published!', 'success');
            navigate('/feed/newest');
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to publish video meme.";
            showNotification(message, 'error');
        } finally {
            setIsPublishing(false);
        }
    };
    
    const reset = () => {
        setSelectedImage(null);
        setGeneratedVideoUrl(null);
        setTopText('');
        setBottomText('');
        setAiPrompt('');
        setAiVideoPrompt('');
        setVideoGenerationStatus('');
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }
        setIsVideoGenerating(false);
    };

    if (isAuthLoading) {
        return <div className="text-center p-10">Loading creator tools...</div>
    }

    const renderEditor = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black flex items-center justify-center p-2 rounded-lg">
                <canvas ref={canvasRef} className="max-w-full max-h-[50vh] object-contain" />
            </div>
            <div className="flex flex-col space-y-4">
                <button onClick={reset} className="text-sm text-primary hover:underline self-start">← Choose a different image</button>
                <input
                    type="text"
                    placeholder="Top Text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                />
                <input
                    type="text"
                    placeholder="Bottom Text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                />

                {isGeminiConfigured && (
                    <>
                        <div className="bg-surface p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-lg">✨ Get AI Suggestions</h3>
                            <input
                                type="text"
                                placeholder="Friend's Name (optional)"
                                value={friendName}
                                onChange={(e) => setFriendName(e.target.value)}
                                className="w-full p-2 bg-background rounded-md border-2 border-gray-600 focus:border-primary focus:outline-none"
                            />
                            <button
                                onClick={handleGetSuggestions}
                                disabled={isLoadingSuggestions}
                                className="w-full bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
                            >
                                {isLoadingSuggestions ? 'Thinking...' : 'Suggest Captions'}
                            </button>
                        </div>
                        <div className="bg-surface p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-lg">🪄 Remix Image with AI</h3>
                            <p className="text-sm text-text-secondary">Describe a change to the image (e.g., "add sunglasses to the cat").</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Remix instruction..."
                                    value={remixPrompt}
                                    onChange={(e) => setRemixPrompt(e.target.value)}
                                    className="w-full p-2 bg-background rounded-md border-2 border-gray-600 focus:border-primary focus:outline-none"
                                />
                                <button
                                    onClick={handleRemixImage}
                                    disabled={isRemixing}
                                    className="bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
                                >
                                    {isRemixing ? 'Remixing...' : 'Remix'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                     <button
                        onClick={handleClearText}
                        className="w-full bg-surface hover:bg-gray-600 text-text-primary font-bold py-3 px-4 rounded-lg text-lg shadow-lg"
                    >
                        Clear Text
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg disabled:bg-gray-500"
                    >
                        {isPublishing ? 'Publishing...' : '✅ Publish Meme'}
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderVideoEditor = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative bg-black flex items-center justify-center p-2 rounded-lg">
                <video src={`${generatedVideoUrl}&key=${process.env.API_KEY}`} className="max-w-full max-h-[50vh] object-contain" controls loop playsInline />
                {topText && (
                    <div className="absolute top-0 left-0 right-0 p-2 text-center text-white font-bold text-xl md:text-2xl uppercase break-words pointer-events-none" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 4px black' }}>
                        {topText.toUpperCase()}
                    </div>
                )}
                {bottomText && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-white font-bold text-xl md:text-2xl uppercase break-words pointer-events-none" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 4px black' }}>
                        {bottomText.toUpperCase()}
                    </div>
                )}
            </div>
            <div className="flex flex-col space-y-4">
                <button onClick={reset} className="text-sm text-primary hover:underline self-start">← Start Over</button>
                <input
                    type="text"
                    placeholder="Top Text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                />
                <input
                    type="text"
                    placeholder="Bottom Text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                />
                 <div className="grid grid-cols-2 gap-4 pt-4">
                     <button
                        onClick={handleClearText}
                        className="w-full bg-surface hover:bg-gray-600 text-text-primary font-bold py-3 px-4 rounded-lg text-lg shadow-lg"
                    >
                        Clear Text
                    </button>
                    <button
                        onClick={handlePublishVideo}
                        disabled={isPublishing}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg disabled:bg-gray-500"
                    >
                        {isPublishing ? 'Publishing...' : '✅ Publish Video Meme'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSelection = () => (
        <>
            {mode === 'template' && (
                <div>
                    <input
                        type="text"
                        placeholder="🔎 Search for a meme template..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 mb-6 bg-surface rounded-lg border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                    {isLoadingTemplates ? <p className="text-center">Loading templates...</p> : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredTemplates.map(template => (
                                <div key={template.id} className="cursor-pointer group" onClick={() => setSelectedImage({ url: template.url, name: template.name, id: template.id })}>
                                    <img src={template.url} alt={template.name} className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform" />
                                    <p className="text-xs text-center mt-1 text-text-secondary truncate group-hover:text-text-primary">{template.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {mode === 'upload' && (
                <div className="max-w-2xl mx-auto text-center bg-surface p-8 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">Upload Your Image</h2>
                    <p className="text-text-secondary mb-6">Choose an image from your device to turn into a meme.</p>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                    />
                </div>
            )}
            {mode === 'ai' && (
                <div className="max-w-2xl mx-auto text-center bg-surface p-8 rounded-xl">
                     <h2 className="text-2xl font-bold mb-4">Describe the Meme You Want</h2>
                     <p className="text-text-secondary mb-6">Be as creative as you want! For example: "A cat wearing sunglasses using a laptop".</p>
                     {isGeminiConfigured ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g., A developer looking at a bug in production"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="flex-grow p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                            />
                            <button
                                onClick={handleGenerateImage}
                                disabled={isLoadingImage}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500"
                            >
                                {isLoadingImage ? 'Generating...' : 'Generate'}
                            </button>
                         </div>
                     ) : (
                        <p className="text-red-400">AI features are not configured. Please contact the administrator.</p>
                     )}
                </div>
            )}
            {mode === 'video' && (
                <div className="max-w-2xl mx-auto text-center bg-surface p-8 rounded-xl">
                     <h2 className="text-2xl font-bold mb-4">Describe the Video Meme You Want</h2>
                     <p className="text-text-secondary mb-6">Be as creative as you want! For example: "A dog skateboarding in space".</p>
                     {isGeminiConfigured ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., A cat DJing at a party"
                                    value={aiVideoPrompt}
                                    onChange={(e) => setAiVideoPrompt(e.target.value)}
                                    className="flex-grow p-3 bg-background rounded-lg border-2 border-surface focus:border-primary focus:outline-none"
                                />
                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={isVideoGenerating}
                                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500"
                                >
                                    {isVideoGenerating ? 'Generating...' : 'Generate'}
                                </button>
                             </div>
                             {isVideoGenerating && <p className="text-secondary animate-pulse">{videoGenerationStatus}</p>}
                         </div>
                     ) : (
                        <p className="text-red-400">AI features are not configured. Please contact the administrator.</p>
                     )}
                </div>
            )}
        </>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-center bg-surface p-2 rounded-lg max-w-2xl mx-auto">
                <button onClick={() => setMode('template')} className={`w-1/4 py-2 rounded-md font-semibold transition-colors ${mode === 'template' ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}>Templates</button>
                <button onClick={() => setMode('upload')} className={`w-1/4 py-2 rounded-md font-semibold transition-colors ${mode === 'upload' ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}>Upload</button>
                <button onClick={() => setMode('ai')} className={`w-1/4 py-2 rounded-md font-semibold transition-colors ${mode === 'ai' ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}>Image with AI</button>
                <button onClick={() => setMode('video')} className={`w-1/4 py-2 rounded-md font-semibold transition-colors ${mode === 'video' ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}>Video with AI</button>
            </div>
            
            {generatedVideoUrl ? renderVideoEditor() : selectedImage ? renderEditor() : renderSelection()}
        </div>
    );
};

export default CreateMemePage;