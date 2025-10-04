import React, { useState, useCallback } from 'react';
import { HashRouter, Route, Routes, NavLink, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateMemePage from './pages/CreateMemePage';
import FeedPage from './pages/FeedPage';
import LeaderboardPage from './pages/LeaderboardPage';
import WinnersPage from './pages/WinnersPage';
import AboutPage from './pages/AboutPage';
import NotificationPopup from './components/NotificationPopup';
import { Notification } from './types';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactUsPage from './pages/ContactUsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './contexts/AuthContext';
import Adsense from './components/Adsense';
import Sidebar from './components/Sidebar';
import MemeDetailPage from './pages/MemeDetailPage';

// Blog Pages
import BlogIndexPage from './pages/BlogIndexPage';
import HowToMakeAMeme from './pages/blog/HowToMakeAMeme';
import WhatMakesAMemeGoViral from './pages/blog/WhatMakesAMemeGoViral';
import HistoryOfMemes from './pages/blog/HistoryOfMemes';
import MemeMarketingStrategy from './pages/blog/MemeMarketingStrategy';
import Top10MemeTemplates from './pages/blog/Top10MemeTemplates';
import HowToWinOurMemeContest from './pages/blog/HowToWinOurMemeContest';
import FairPlayPolicyExplained from './pages/blog/FairPlayPolicyExplained';
import UsingAIToCreateMemes from './pages/blog/UsingAIToCreateMemes';

const HeaderActions: React.FC<{showNotification: Function}> = ({ showNotification }) => {
    const navigate = useNavigate();
    const { user, signOut, isLoading } = useAuth();
    
    const handleSignOut = async () => {
        await signOut();
        showNotification('You have been signed out.', 'info');
        navigate('/');
    };
    
    if (isLoading) {
        return <div className="h-8 w-24 bg-surface rounded-md animate-pulse"></div>;
    }

    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <NavLink to="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
                    <img src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`} alt="user avatar" className="w-8 h-8 rounded-full inline-block mr-2" />
                    {user.name}
                </NavLink>
                <button onClick={handleSignOut} className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                    Sign Out
                </button>
                <NavLink to="/create" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Create Meme
                </NavLink>
            </div>
        );
    }
    
    return (
        <div className="flex items-center space-x-4">
            <NavLink to="/signin" className="bg-surface hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Sign In
            </NavLink>
            <NavLink to="/signup" className="bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                Sign Up
            </NavLink>
        </div>
    );
};

const MainContent: React.FC = () => {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ id: Date.now(), message, type });
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    }, []);

    const handleMobileSignOut = async () => {
        await signOut();
        showNotification('You have been signed out.', 'info');
        setIsMenuOpen(false);
        navigate('/');
    };

    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors";
    const activeNavLinkClasses = "bg-primary text-white";
    
    const mobileNavLinkClasses = (isActive: boolean) => isActive ? 'bg-primary text-white block px-3 py-2 rounded-md text-base font-medium' : 'text-text-secondary hover:bg-surface hover:text-white block px-3 py-2 rounded-md text-base font-medium';

    const showSidebar = location.pathname.startsWith('/feed') || location.pathname.startsWith('/blog');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                         {/* Left Items */}
                        <div className="flex items-center">
                             {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-white hover:bg-surface"
                                    aria-controls="mobile-menu"
                                    aria-expanded={isMenuOpen}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMenuOpen ? (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    ) : (
                                        <span className="font-semibold text-sm uppercase">Menu</span>
                                    )}
                                </button>
                            </div>
                             {/* Desktop Logo and Nav */}
                            <div className="hidden md:flex items-center">
                                <NavLink to="/" className="text-2xl font-bold text-primary">FreeMemesGenerator</NavLink>
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to="/" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Home</NavLink>
                                    <NavLink to="/feed/trending" className={({ isActive }) => isActive || location.pathname.startsWith('/feed') ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Memes</NavLink>
                                    <NavLink to="/leaderboard" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Leaderboard</NavLink>
                                    <NavLink to="/winners" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Winners</NavLink>
                                    <NavLink to="/blog" className={({ isActive }) => isActive || location.pathname.startsWith('/blog') ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Blog</NavLink>
                                    <NavLink to="/about" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>About</NavLink>
                                </div>
                            </div>
                        </div>

                        {/* Absolute Centered Mobile Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
                             <NavLink to="/" className="text-xl font-bold text-primary">FreeMemesGenerator</NavLink>
                        </div>
                        
                        {/* Right Items */}
                        <div className="hidden md:flex items-center justify-end">
                             <HeaderActions showNotification={showNotification} />
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink to="/" className={({isActive}) => mobileNavLinkClasses(isActive)} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                            <NavLink to="/feed/trending" className={({isActive}) => mobileNavLinkClasses(isActive || location.pathname.startsWith('/feed'))} onClick={() => setIsMenuOpen(false)}>Memes</NavLink>
                            <NavLink to="/leaderboard" className={({isActive}) => mobileNavLinkClasses(isActive)} onClick={() => setIsMenuOpen(false)}>Leaderboard</NavLink>
                            <NavLink to="/winners" className={({isActive}) => mobileNavLinkClasses(isActive)} onClick={() => setIsMenuOpen(false)}>Winners</NavLink>
                            <NavLink to="/blog" className={({isActive}) => mobileNavLinkClasses(isActive || location.pathname.startsWith('/blog'))} onClick={() => setIsMenuOpen(false)}>Blog</NavLink>
                            <NavLink to="/about" className={({isActive}) => mobileNavLinkClasses(isActive)} onClick={() => setIsMenuOpen(false)}>About</NavLink>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-700">
                            {user ? (
                                <div className="px-5 space-y-3">
                                    <NavLink to="/profile" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full" src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100`} alt="user avatar" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium leading-none text-white">{user.name}</div>
                                        </div>
                                    </NavLink>
                                    <button onClick={handleMobileSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-surface hover:text-white">
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="px-2 space-y-2">
                                    <NavLink to="/signin" className="block w-full text-center bg-surface hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                        Sign In
                                    </NavLink>
                                    <NavLink to="/signup" className="block w-full text-center bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                        Sign Up
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <div className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-12 lg:gap-8' : ''}>
                    <main className={showSidebar ? 'lg:col-span-9' : ''}>
                        <Adsense adSlot="1234567890" /> {/* Top Banner Ad */}
                        <Routes>
                            <Route path="/" element={<HomePage showNotification={showNotification} />} />
                            <Route path="/create" element={<CreateMemePage showNotification={showNotification} />} />
                            <Route path="/feed/:filter" element={<FeedPage showNotification={showNotification} />} />
                            <Route path="/meme/:id" element={<MemeDetailPage showNotification={showNotification} />} />
                            <Route path="/leaderboard" element={<LeaderboardPage showNotification={showNotification} />} />
                            <Route path="/winners" element={<WinnersPage showNotification={showNotification} />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/privacy" element={<PrivacyPolicyPage />} />
                            <Route path="/contact" element={<ContactUsPage showNotification={showNotification} />} />
                            <Route path="/terms" element={<TermsOfServicePage />} />
                            <Route path="/signin" element={<SignInPage showNotification={showNotification} />} />
                            <Route path="/signup" element={<SignUpPage showNotification={showNotification} />} />
                            <Route path="/profile" element={<ProfilePage showNotification={showNotification} />} />

                            {/* Blog Routes */}
                            <Route path="/blog" element={<BlogIndexPage />} />
                            <Route path="/blog/how-to-make-a-meme" element={<HowToMakeAMeme />} />
                            <Route path="/blog/what-makes-a-meme-go-viral" element={<WhatMakesAMemeGoViral />} />
                            <Route path="/blog/history-of-memes" element={<HistoryOfMemes />} />
                            <Route path="/blog/meme-marketing-strategy" element={<MemeMarketingStrategy />} />
                            <Route path="/blog/top-10-meme-templates" element={<Top10MemeTemplates />} />
                            <Route path="/blog/how-to-win-our-meme-contest" element={<HowToWinOurMemeContest />} />
                            <Route path="/blog/fair-play-policy-explained" element={<FairPlayPolicyExplained />} />
                            <Route path="/blog/using-ai-to-create-memes" element={<UsingAIToCreateMemes />} />
                        </Routes>
                    </main>
                    {showSidebar && <Sidebar />}
                </div>
            </div>

            <footer className="bg-surface mt-8 py-6">
                <div className="container mx-auto text-center">
                    <div className="flex justify-center space-x-6 mb-4">
                        <NavLink to="/privacy" className="text-sm text-text-secondary hover:text-primary transition-colors">Privacy Policy</NavLink>
                        <NavLink to="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">Contact Us</NavLink>
                        <NavLink to="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">Terms of Service</NavLink>
                        <NavLink to="/blog" className="text-sm text-text-secondary hover:text-primary transition-colors">Blog</NavLink>
                    </div>
                    <div className="text-text-secondary text-sm">
                        &copy; {new Date().getFullYear()} freememesgenerator.com - Create. Vote. Win!
                    </div>
                </div>
            </footer>
            
            <NavLink to="/create" className="md:hidden fixed bottom-5 right-5 bg-primary hover:bg-primary-dark text-white font-bold p-4 rounded-full shadow-lg z-40 transition-transform transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </NavLink>

            {notification && <NotificationPopup message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
}

const App: React.FC = () => (
    <HashRouter>
        <MainContent />
    </HashRouter>
);

export default App;