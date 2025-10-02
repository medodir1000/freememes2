import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getMemes } from '../services/supabaseService';
import MemeCard from '../components/MemeCard';
import { Meme } from '../types';
import Adsense from '../components/Adsense';

interface FeedPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const FeedPage: React.FC<FeedPageProps> = ({ showNotification }) => {
    const { filter = 'trending' } = useParams<{ filter: string }>();
    const [memes, setMemes] = useState<Meme[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMemes = async () => {
            setIsLoading(true);
            try {
                const fetchedMemes = await getMemes(filter);
                setMemes(fetchedMemes);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load memes.';
                showNotification(message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadMemes();

    }, [filter, showNotification]);
    
    const navLinkClasses = "px-4 py-2 rounded-lg font-semibold transition";
    const activeNavLinkClasses = "bg-primary text-white";
    const inactiveNavLinkClasses = "bg-surface text-text-secondary hover:bg-gray-600";

    const MemeGridSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-surface rounded-xl shadow-lg animate-pulse">
                    <div className="w-full h-56 bg-gray-600 rounded-t-xl"></div>
                    <div className="p-4">
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                        <div className="h-10 bg-gray-600 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <div className="mb-8 flex justify-center items-center gap-2 sm:gap-4 bg-background p-2 rounded-lg">
                <NavLink to="/feed/trending" className={({isActive}) => `${navLinkClasses} ${isActive || filter === 'trending' ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Most Voted</NavLink>
                <NavLink to="/feed/newest" className={({isActive}) => `${navLinkClasses} ${isActive || filter === 'newest' ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Newest</NavLink>
                <NavLink to="/feed/this-week" className={({isActive}) => `${navLinkClasses} ${isActive || filter === 'this-week' ? activeNavLinkClasses : inactiveNavLinkClasses}`}>This Week</NavLink>
            </div>

            {isLoading ? <MemeGridSkeleton /> : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                         {memes.filter(Boolean).map((meme, index) => (
                            <React.Fragment key={meme.id}>
                                <MemeCard meme={meme} showNotification={showNotification} />
                                {(index + 1) % 8 === 0 && (
                                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 my-4">
                                        <Adsense adSlot="4567890123" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    
                    {memes.length === 0 && (
                        <div className="text-center col-span-full py-16 text-text-secondary">
                            <h3 className="text-2xl font-bold">No memes found!</h3>
                            <p>Be the first to create one for this category.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FeedPage;