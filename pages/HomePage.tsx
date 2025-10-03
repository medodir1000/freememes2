
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import { getLeaderboard, getMemes } from '../services/supabaseService';
import { User, Meme } from '../types';
import MemeCard from '../components/MemeCard';
import Adsense from '../components/Adsense';

interface HomePageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const LeaderboardPreview: React.FC<{ users: User[], isLoading: boolean }> = ({ users, isLoading }) => {
    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-center text-text-primary mb-4">Top Creators This Month</h3>
            <div className="bg-surface rounded-lg p-4 shadow-lg">
                {isLoading ? (
                    <ul className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-background rounded-md animate-pulse">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-600"></div>
                                    <div className="h-4 bg-gray-600 rounded w-24"></div>
                                </div>
                                <div className="h-4 bg-gray-600 rounded w-16"></div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="space-y-3">
                        {users.slice(0, 3).filter(Boolean).map((user, index) => (
                            <li key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                                <div className="flex items-center">
                                    <span className="text-lg font-bold text-text-secondary mr-3">{index + 1}</span>
                                    <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                    <span className="font-semibold text-text-primary">{user.name}</span>
                                </div>
                                <span className="font-bold text-primary">{(user.totalVotes ?? 0).toLocaleString()} votes</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="text-center mt-6">
                <NavLink to="/leaderboard" className="text-primary hover:underline">View Full Leaderboard →</NavLink>
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ showNotification }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [memes, setMemes] = useState<Meme[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingMemes, setIsLoadingMemes] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingUsers(true);
            setIsLoadingMemes(true);
            try {
                const fetchedUsers = await getLeaderboard();
                setUsers(fetchedUsers);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch users.';
                showNotification(message, 'error');
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoadingUsers(false);
            }

            try {
                const fetchedMemes = await getMemes('newest');
                setMemes(fetchedMemes);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to fetch memes.';
                showNotification(message, 'error');
                console.error("Failed to fetch memes", error);
            } finally {
                setIsLoadingMemes(false);
            }
        };
        
        fetchData();

    }, [showNotification]);

    const MemeGridSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
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
        <div className="space-y-16">
            <section className="bg-surface rounded-xl shadow-2xl p-8 md:p-12 text-center transform transition hover:scale-105 duration-300">
                <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight">
                    Create. Vote. <span className="text-primary">Win $100 Cash!</span>
                </h1>
                <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                    Get 2000+ votes on your meme to qualify for our monthly $100 prize draw. What are you waiting for?
                </p>
                <NavLink 
                    to="/create" 
                    className="mt-8 inline-block bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-110"
                >
                    🟢 Start Creating Now
                </NavLink>
            </section>
            
            <Adsense adSlot="2345678901" />

            <section>
                <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">✨ Newest Creations</h2>
                {isLoadingMemes ? <MemeGridSkeleton /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {memes.slice(0, 4).filter(Boolean).map(meme => (
                            <MemeCard key={meme.id} meme={meme} showNotification={showNotification} />
                        ))}
                    </div>
                )}
                 <div className="text-center mt-6">
                    <NavLink to="/feed/newest" className="text-primary hover:underline">See All New Memes →</NavLink>
                </div>
            </section>

            <Adsense adSlot="3456789012" />

            <section className="text-center">
                <h2 className="text-3xl font-bold text-text-primary mb-4">Next Prize Draw In...</h2>
                <div className="max-w-md mx-auto">
                    <CountdownTimer />
                </div>
            </section>

            <section>
                <LeaderboardPreview users={users} isLoading={isLoadingUsers} />
            </section>
        </div>
    );
};

export default HomePage;
