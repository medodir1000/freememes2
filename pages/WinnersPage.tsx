import React, { useState, useEffect } from 'react';
import { getWinners } from '../services/supabaseService';
import { Winner } from '../types';

interface WinnersPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const WinnersPage: React.FC<WinnersPageProps> = ({ showNotification }) => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            setIsLoading(true);
            try {
                const fetchedWinners = await getWinners();
                setWinners(fetchedWinners);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch winners.';
                showNotification(message, 'error');
                console.error("Failed to fetch winners", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWinners();

    }, [showNotification]);

    const WinnerCardSkeleton = () => (
         <div className="bg-surface rounded-xl shadow-lg p-6 flex flex-col items-center text-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-600 mb-4"></div>
            <div className="h-5 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">🎉 Past Winners 🎉</h1>
            
            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, index) => <WinnerCardSkeleton key={index} />)}
                 </div>
            ) : (
                <>
                    <p className="text-center text-text-secondary mb-10">Celebrating our monthly champions who each won $100!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {winners.map(winner => (
                            <div key={winner.id} className="bg-surface rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform transform hover:-translate-y-2">
                                <img src={winner.avatar_url} alt={winner.name} className="w-24 h-24 rounded-full border-4 border-primary mb-4" loading="lazy" decoding="async" />
                                <h3 className="text-xl font-bold text-text-primary">{winner.name}</h3>
                                <p className="text-text-secondary">Winner of</p>
                                <p className="font-semibold text-primary">{winner.month}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-lg bg-background p-6 rounded-lg">
                        <p>You could be next! <a href="/#/create" className="text-primary font-bold hover:underline">Start creating</a> your viral meme now!</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default WinnersPage;