
import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getMemeById } from '../services/supabaseService';
import MemeCard from '../components/MemeCard';
import { Meme } from '../types';

interface MemeDetailPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const MemeDetailPage: React.FC<MemeDetailPageProps> = ({ showNotification }) => {
    const { id } = useParams<{ id: string }>();
    const [meme, setMeme] = useState<Meme | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMeme = async () => {
            if (!id) {
                setError('No meme ID provided.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const fetchedMeme = await getMemeById(id);
                if (fetchedMeme) {
                    setMeme(fetchedMeme);
                } else {
                    setError('Meme not found. It may have been removed.');
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load meme.';
                setError(message);
                showNotification(message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadMeme();
    }, [id, showNotification]);

    const Skeleton = () => (
        <div className="bg-surface rounded-xl shadow-lg animate-pulse max-w-lg mx-auto">
            <div className="w-full h-80 bg-gray-600 rounded-t-xl"></div>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-10 bg-gray-600 rounded"></div>
                    <div className="h-10 bg-gray-600 rounded"></div>
                </div>
                <div className="border-t border-gray-700 pt-3">
                    <div className="h-10 bg-gray-600 rounded"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-lg">
                <NavLink to="/feed/trending" className="text-primary hover:underline mb-4 inline-block">
                    &larr; Back to Trending Memes
                </NavLink>
            </div>
            {isLoading ? (
                <Skeleton />
            ) : error ? (
                <div className="text-center p-10 bg-surface rounded-lg">
                    <h2 className="text-2xl font-bold text-red-500">Oops!</h2>
                    <p className="text-text-secondary mt-2">{error}</p>
                </div>
            ) : meme ? (
                 <div className="w-full max-w-lg">
                    <MemeCard meme={meme} showNotification={showNotification} />
                 </div>
            ) : null}
        </div>
    );
};

export default MemeDetailPage;
