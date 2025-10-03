import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SignUpPageProps {
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ showNotification }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, signUp, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate('/');
        }
    }, [user, isAuthLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !email || !password) {
            showNotification('Please fill out all fields.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters.', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            await signUp(username, email, password);
            showNotification('Welcome! Your account has been created.', 'success');
            navigate('/');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-surface p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold text-primary mb-4 text-center">Create an Account</h1>
            <p className="text-center text-text-secondary mb-8">
                Join the community and start winning!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="MemeLord"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-background rounded-lg border-2 border-gray-600 focus:border-primary focus:outline-none"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transition-colors disabled:bg-gray-500"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-text-secondary">
                <p>Already have an account? <NavLink to="/signin" className="text-primary hover:underline">Sign in</NavLink></p>
            </div>
        </div>
    );
};

export default SignUpPage;