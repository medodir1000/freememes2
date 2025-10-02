
import React from 'react';
import { NavLink } from 'react-router-dom';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold text-primary mb-6">About the $100 Prize</h1>
            <div className="space-y-6 text-text-secondary leading-relaxed">
                <p>Welcome to FreeMemesGenerator.com, the ultimate platform for meme lovers! We believe in rewarding creativity, which is why we host a monthly cash prize giveaway.</p>
                
                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">How to Win $100</h2>
                <p>The rules are simple. Your goal is to get your meme to the top!</p>
                
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <span className="font-bold text-text-primary">Create a Meme:</span> Use our powerful Meme Generator to create a hilarious and original meme.
                    </li>
                    <li>
                        <span className="font-bold text-text-primary">Publish and Share:</span> Once you publish your meme, it goes live on our public feed. Share it with your friends, family, and on social media to get votes.
                    </li>
                    <li>
                        <span className="font-bold text-text-primary">Reach 2,000 Votes:</span> Any single meme that gets <span className="text-secondary font-bold">2,000 or more "Good Meme" 👍 votes</span> within a single calendar month automatically qualifies you for that month's prize draw.
                    </li>
                    <li>
                        <span className="font-bold text-text-primary">The Prize Draw:</span> At the end of each month, we will randomly select one winner from the pool of all qualifying creators. 
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Prize Details</h2>
                 <p>The monthly prize is <span className="font-bold">$100 USD</span>. Winners will be contacted via email (if logged in with Google) or an on-site notification. You can choose to receive your prize via PayPal, a popular Gift Card, or a Bank Transfer.</p>
                
                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Fair Play</h2>
                 <p>We monitor for fake votes and spam. Any user found to be cheating will be disqualified. Let's keep it fun and fair for everyone!</p>

                <div className="text-center pt-8">
                     <NavLink 
                        to="/create" 
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105"
                    >
                        Ready to Win? Create a Meme!
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
