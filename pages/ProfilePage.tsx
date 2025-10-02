import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ showNotification }) => {
    const { user, signOut, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="text-center">Loading profile...</div>
    }

    if (!user) {
        return (
            <div className="text-center">
                <p>You must be signed in to view this page.</p>
            </div>
        );
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            showNotification('You have been signed out successfully.', 'success');
            navigate('/');
        } catch (error) {
            showNotification('Failed to sign out.', 'error');
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-center">
            <img 
                src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`}
                alt="User Avatar"
                className="w-32 h-32 rounded-full mx-auto border-4 border-primary mb-4"
            />
            <h1 className="text-4xl font-bold text-text-primary">{user.name}</h1>
            <p className="text-text-secondary mt-2">{user.email}</p>

            <div className="mt-8 border-t border-gray-600 pt-6 space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Your Stats</h2>
                <div className="flex justify-around">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{(user.memesCreated ?? 0).toLocaleString()}</p>
                        <p className="text-text-secondary">Memes Created</p>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{(user.totalVotes ?? 0).toLocaleString()}</p>
                        <p className="text-text-secondary">Total Votes</p>
                    </div>
                </div>
                 {user.badge === 'prize-eligible' && (
                    <div className="mt-6 bg-primary/20 text-primary font-bold p-3 rounded-lg">
                        🎉 You are eligible for this month's $100 prize draw!
                    </div>
                )}
            </div>

            <button
                onClick={handleSignOut}
                className="mt-10 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
};

export default ProfilePage;