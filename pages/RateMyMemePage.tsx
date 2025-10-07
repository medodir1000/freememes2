import React, { useState, useCallback, useEffect } from 'react';
import { checkAiServiceStatus, rateMeme } from '../services/geminiService';
import { MemeRating } from '../types';

interface RateMyMemePageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const RadialProgress: React.FC<{ score: number }> = ({ score }) => {
    const radius = 80;
    const stroke = 15;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const scoreColor = score < 40 ? 'text-red-500' : score < 75 ? 'text-yellow-400' : 'text-primary';
    const ringColor = score < 40 ? '#EF4444' : score < 75 ? '#FBBF24' : '#10B981';

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-surface"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, stroke: ringColor }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-in-out"
                />
            </svg>
            <span className={`absolute text-5xl font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

const loadingMessages = [
    "Consulting the meme gods...",
    "Calibrating the laugh-o-meter...",
    "Analyzing dankness levels...",
    "Checking for viral potential...",
    "Decoding the punchline...",
    "This is harder than it looks, you know."
];

const RateMyMemePage: React.FC<RateMyMemePageProps> = ({ showNotification }) => {
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MemeRating | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [isAiConfigured, setIsAiConfigured] = useState<boolean | null>(null); // null = checking

    useEffect(() => {
        checkAiServiceStatus().then(status => setIsAiConfigured(status));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            resetState();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImageBase64(base64String.split(',')[1]); // remove data:image/jpeg;base64,
                setPreviewUrl(URL.createObjectURL(file));
            };
            reader.onerror = () => {
                showNotification("Failed to read the file.", "error");
                setError("Failed to read the file.");
            }
            reader.readAsDataURL(file);
        }
    };

    const handleRateMeme = async () => {
        if (!imageBase64) {
            showNotification("Please upload an image first.", "info");
            return;
        }

        setIsLoading(true);
        setError(null);

        const messageInterval = setInterval(() => {
            setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 2000);

        try {
            const rating = await rateMeme(imageBase64);
            if (rating) {
                setResults(rating);
            } else {
                throw new Error("The AI couldn't provide a rating. Try a different image.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
            showNotification(message, "error");
        } finally {
            setIsLoading(false);
            clearInterval(messageInterval);
        }
    };

    const resetState = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageBase64(null);
        setPreviewUrl(null);
        setResults(null);
        setError(null);
        setIsLoading(false);
    };

    if (isAiConfigured === null) {
        return (
             <div className="max-w-2xl mx-auto text-center bg-surface p-8 rounded-xl">
                 <h1 className="text-4xl font-bold text-primary mb-4">Meme Coach</h1>
                 <p>Checking AI service status...</p>
            </div>
        )
    }

    if (!isAiConfigured) {
        return (
            <div className="max-w-2xl mx-auto text-center bg-surface p-8 rounded-xl">
                 <h1 className="text-4xl font-bold text-primary mb-4">Meme Coach</h1>
                 <p className="text-red-400">AI features are not configured. This feature is unavailable. Please contact the administrator.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Meme Coach</h1>
                <p className="mt-2 text-lg text-text-secondary">Upload your meme and our AI expert will rate its viral potential!</p>
            </div>

            {!previewUrl && (
                <div className="bg-surface p-8 rounded-xl border-2 border-dashed border-gray-600 text-center">
                    <h2 className="text-2xl font-bold mb-4">Upload Your Meme Image</h2>
                    <p className="text-text-secondary mb-6">Choose a JPG, PNG, or GIF to get rated.</p>
                    <input
                        type="file"
                        id="meme-upload"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="meme-upload" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                        Choose File
                    </label>
                </div>
            )}

            {previewUrl && (
                <div className="bg-surface p-6 rounded-xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center">
                            <img src={previewUrl} alt="Meme preview" className="max-w-full max-h-80 object-contain rounded-lg shadow-md" />
                            <div className="flex gap-4 mt-4">
                                <button onClick={handleRateMeme} disabled={isLoading} className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {isLoading ? 'Analyzing...' : 'Rate My Meme!'}
                                </button>
                                <button onClick={resetState} className="bg-gray-600 hover:bg-gray-700 text-text-primary font-bold py-3 px-6 rounded-lg">
                                    Try Another
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center min-h-[300px]">
                            {isLoading && (
                                <div className="space-y-4">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                                    <p className="text-lg text-secondary animate-pulse">{loadingMessage}</p>
                                </div>
                            )}
                            {error && <p className="text-red-500 font-bold">{error}</p>}
                            {results && (
                                <div className="w-full space-y-4 animate-fade-in">
                                    <h2 className="text-3xl font-bold">The Verdict Is In!</h2>
                                    <RadialProgress score={results.viralityScore} />
                                    <div className="bg-background p-4 rounded-lg">
                                        <h3 className="text-lg font-bold text-secondary">The Critique</h3>
                                        <p className="text-text-secondary italic">"{results.critique}"</p>
                                    </div>
                                     <div className="bg-background p-4 rounded-lg">
                                        <h3 className="text-lg font-bold text-primary">Suggestions</h3>
                                        <ul className="list-disc list-inside text-left text-text-secondary space-y-1">
                                            {results.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateMyMemePage;