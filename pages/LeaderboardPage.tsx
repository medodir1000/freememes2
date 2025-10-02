
import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/supabaseService';
import { User } from '../types';

interface LeaderboardPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ showNotification }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const fetchedUsers = await getLeaderboard();
                setUsers(fetchedUsers);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard.';
                showNotification(message, 'error');
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLeaderboard();

    }, [showNotification]);

    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-gray-300';
        if (rank === 2) return 'text-yellow-600';
        return 'text-text-secondary';
    };

    const LeaderboardSkeleton = () => (
        <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center p-3 bg-background rounded-lg shadow-md animate-pulse">
                    <div className="w-12 h-6 bg-gray-600 rounded"></div>
                    <div className="w-12 h-12 rounded-full mx-4 bg-gray-600"></div>
                    <div className="flex-grow space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                    </div>
                    <div className="text-right space-y-2">
                         <div className="h-5 bg-gray-600 rounded w-16"></div>
                         <div className="h-3 bg-gray-600 rounded w-12"></div>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">🏆 Monthly Leaderboard 🏆</h1>
            {isLoading ? (
                 <div className="bg-surface rounded-xl shadow-lg p-4 sm:p-6"><LeaderboardSkeleton /></div>
            ) : (
                <div className="bg-surface rounded-xl shadow-lg p-4 sm:p-6">
                    <ul className="space-y-4">
                        {users.filter(Boolean).map((user, index) => (
                            <li key={user.id} className="flex items-center p-3 bg-background rounded-lg shadow-md transition-transform transform hover:scale-105">
                                <div className={`w-12 text-center text-2xl font-bold ${getRankColor(index)}`}>
                                    {index + 1}
                                </div>
                                <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`} alt={user.name} className="w-12 h-12 rounded-full mx-4" />
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-text-primary flex items-center">
                                        {user.name}
                                        {user.badge === 'prize-eligible' && (
                                            <span className="ml-2 text-xs bg-primary text-white font-bold py-1 px-2 rounded-full">
                                                $100 Eligible
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-text-secondary">{(user.memesCreated ?? 0).toLocaleString()} memes created</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-xl text-primary">{(user.totalVotes ?? 0).toLocaleString()}</p>
                                    <p className="text-sm text-text-secondary">Total Votes</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;
