
import React from 'react';
import { NavLink } from 'react-router-dom';
import Adsense from '../../components/Adsense';

const HowToWinOurMemeContest: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">How to Win Our $100 Monthly Meme Contest</h1>
            
            <div className="space-y-6">
                <p>So, you want to take home the $100 cash prize? You've got the creativity, but a little strategy can go a long way. This guide will walk you through the rules, provide tips for creating a vote-worthy meme, and show you how to maximize your reach.</p>
                
                <Adsense adSlot="8901234567" adFormat="fluid" />

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">The Golden Rule: 2,000 Votes</h2>
                <p>The main goal is simple: create a single meme that gets <strong className="text-secondary">2,000 or more "Good Meme" 👍 votes</strong> within one calendar month. Once you hit that magic number, you are automatically entered into the prize draw for that month. Every qualifying meme creator has an equal chance to win.</p>
                <p>You can read the full contest details on our <NavLink to="/about" className="text-primary hover:underline">About Page</NavLink>.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Tips for Creating a Winning Meme</h2>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <strong className="text-text-primary">Tap into Trends:</strong> Is there a new movie, TV show, or event everyone is talking about? Memes about current events often get a lot of traction quickly. Keep an eye on what's trending and think about how you can put a funny spin on it.
                    </li>
                    <li>
                        <strong className="text-text-primary">Be Highly Relatable:</strong> Create memes about shared experiences. Think about work-from-home struggles, student life, dating, or funny things pets do. The more people who say "that's so me," the more votes you'll get.
                    </li>
                    <li>
                        <strong className="text-text-primary">Master the Punchline:</strong> A great meme is like a great joke. The top text often sets up a situation, and the bottom text delivers the punchline. Make it unexpected and witty.
                    </li>
                    <li>
                        <strong className="text-text-primary">Use High-Quality Images:</strong> Whether you're using a template or generating an image with AI, make sure it's clear and not pixelated. A clean look makes your meme more appealing.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Strategy for Getting Votes</h2>
                <p>Creating the meme is only half the battle. Now you need to get eyes on it!</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <strong className="text-text-primary">Share, Share, Share:</strong> Use the built-in share buttons on your meme card. Don't be shy! Post it on your Facebook, share it in WhatsApp groups, and pin it on Pinterest.
                    </li>
                    <li>
                        <strong className="text-text-primary">Know Your Audience:</strong> Share your meme where it will be appreciated. If you made a gaming meme, share it in gaming communities (where allowed). If it's a programming joke, share it with your developer friends.
                    </li>
                    <li>
                        <strong className="text-text-primary">Ask for Votes (Nicely):</strong> When you share your meme, there's nothing wrong with saying, "Hey, check out my new meme! If you like it, please give it a vote to help me win the monthly contest!"
                    </li>
                    <li>
                        <strong className="text-text-primary">Engage with Comments:</strong> When people comment on your meme, reply to them! Building a little community around your post can encourage more people to engage and vote.
                    </li>
                </ul>

                <div className="text-center pt-8">
                     <NavLink 
                        to="/create" 
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105"
                    >
                        Ready to Get Started? Create Your Meme Now!
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default HowToWinOurMemeContest;
