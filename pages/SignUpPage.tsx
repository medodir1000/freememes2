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
    const { user, signUp, signInWithGoogle, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate('/');
        }
    }, [user, isAuthLoading, navigate]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with Google Sign-In.';
            showNotification(errorMessage, 'error');
            setIsLoading(false);
        }
    };

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

            <div className="space-y-6">
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Sign Up with Google
                </button>

                <div className="flex items-center before:flex-1 before:border-t before:border-gray-500 before:mt-0.5 after:flex-1 after:border-t after:border-gray-500 after:mt-0.5">
                    <p className="text-center font-semibold mx-4 mb-0 text-text-secondary">OR</p>
                </div>

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
            </div>

            <div className="mt-6 text-center text-text-secondary">
                <p>Already have an account? <NavLink to="/signin" className="text-primary hover:underline">Sign in</NavLink></p>
            </div>
        </div>
    );
};

export default SignUpPage;