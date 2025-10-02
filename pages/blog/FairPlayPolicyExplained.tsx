
import React from 'react';
import { NavLink } from 'react-router-dom';
import Adsense from '../../components/Adsense';

const FairPlayPolicyExplained: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">Fair Play and a Fun Community: Our Policy Explained</h1>
            
            <div className="space-y-6">
                <p>At FreeMemesGenerator.com, our goal is to build a vibrant, creative, and fair community where everyone has a chance to shine. Our monthly $100 prize is a way to reward the creativity and humor that you bring to our platform. To ensure the contest is fun and equitable for everyone, we have a strict Fair Play Policy.</p>

                <Adsense adSlot="5678901234" adFormat="fluid" />

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Why a Fair Play Policy is Important</h2>
                <p>A fair contest is a fun contest. When some people use dishonest tactics to gain an advantage, it ruins the experience for the entire community. Our policy exists to protect the integrity of the competition and ensure that the most genuinely popular memes are the ones that get recognized.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">What We Consider Cheating</h2>
                <p>Any attempt to artificially inflate a meme's vote count is considered a violation of our Fair Play Policy. This includes, but is not limited to:</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <strong className="text-text-primary">Using Bots or Scripts:</strong> Any automated system designed to cast votes is strictly forbidden.
                    </li>
                    <li>
                        <strong className="text-text-primary">Vote-for-Vote Schemes:</strong> Organized groups that agree to vote for each other's content to inflate numbers rather than based on merit are not allowed.
                    </li>
                    <li>
                        <strong className="text-text-primary">Creating Multiple Accounts:</strong> A single person creating numerous accounts to vote for their own content is against the rules.
                    </li>
                    <li>
                        <strong className="text-text-primary">Spamming:</strong> Excessively posting links to your meme in unrelated contexts or in a way that harasses other users is prohibited.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">How We Enforce the Policy</h2>
                <p>We have a combination of automated systems and manual reviews in place to detect suspicious activity. Our systems analyze voting patterns, account creation dates, IP addresses, and other data points to identify behavior that goes against our rules. If we detect activity that violates our policy, we will take action.</p>
                <p>Consequences can range from removing fraudulent votes to disqualifying a meme from the contest, and in serious cases, suspending the user's account.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">How You Can Help</h2>
                <p>If you suspect someone is cheating, please don't engage with them directly. You can use the "Report" feature on a meme (coming soon!) or contact us through our <NavLink to="/contact" className="text-primary hover:underline">Contact Page</NavLink>. Providing a link to the meme in question and a brief description of why you believe it's suspicious is very helpful.</p>
                
                <div className="text-center pt-8">
                    <p className="text-lg">Thank you for helping us keep FreeMemesGenerator.com a fun and fair place for everyone!</p>
                </div>
            </div>
        </div>
    );
};

export default FairPlayPolicyExplained;
