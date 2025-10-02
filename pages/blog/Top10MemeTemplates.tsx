
import React from 'react';
import { NavLink } from 'react-router-dom';
import Adsense from '../../components/Adsense';

const Top10MemeTemplates: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">The Top 10 Meme Templates of All Time</h1>
            
            <div className="space-y-8">
                <p>Meme templates are the canvases of the internet, the foundation upon which countless jokes are built. While new formats emerge daily, some have stood the test of time, becoming legendary pillars of meme culture. Here is our (highly subjective) list of the top 10 most iconic meme templates.</p>
                
                <Adsense adSlot="0123456789" adFormat="fluid" />

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">10. Woman Yelling at a Cat</h2>
                    <p className="mt-2">A brilliant combination of two unrelated images: a screenshot of a distraught reality TV star and a photo of a confused-looking white cat sitting at a dinner table. It perfectly captures the dynamic of a one-sided, irrational argument.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">9. Change My Mind</h2>
                    <p className="mt-2">Featuring political commentator Steven Crowder at a table with a sign that reads "Male Privilege is a Myth | Change My Mind." The template is used to present a controversial or funny opinion, daring the internet to challenge it.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">8. Two Buttons</h2>
                    <p className="mt-2">A stock photo of a person sweating profusely while trying to decide between two big red buttons. It represents any difficult or stressful decision, especially when both options are tempting or terrible.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">7. Surprised Pikachu</h2>
                    <p className="mt-2">A low-resolution screenshot of Pikachu from the Pokémon anime with his mouth agape. It's the perfect reaction for a situation where a completely obvious outcome occurs, yet you still act shocked.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">6. Is This a Pigeon?</h2>
                    <p className="mt-2">From the anime "The Brave Fighter of Sun Fighbird," this meme shows a character mistaking a butterfly for a pigeon. It's used to label someone who is completely clueless or misinterpreting something obvious.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">5. Expanding Brain</h2>
                    <p className="mt-2">A multi-panel meme that shows increasingly absurd or "enlightened" ways of thinking about a simple concept, culminating in a glowing, cosmic brain. It's a sarcastic take on intellectualism.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">4. One Does Not Simply Walk into Mordor</h2>
                    <p className="mt-2">Featuring Boromir from "The Lord of the Rings," this classic image macro is used to describe any task that is far more difficult than it sounds. A true veteran of the meme wars.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">3. Hide the Pain Harold</h2>
                    <p className="mt-2">A stock photo model whose pained, forced smile perfectly captures the feeling of trying to stay positive while enduring internal suffering. Harold is the face of quiet desperation everywhere.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">2. Drake Hotline Bling</h2>
                    <p className="mt-2">A two-panel image of the rapper Drake, looking displeased in the first panel and approving in the second. It's a simple, versatile format for showing preference for one thing over another.</p>
                </div>

                <div className="pt-4 border-t border-gray-600">
                    <h2 className="text-2xl font-bold text-text-primary">1. Distracted Boyfriend</h2>
                    <p className="mt-2">Perhaps the most versatile and story-rich meme of the modern era. A stock photo shows a man turning to check out another woman while his girlfriend looks on in disgust. It can represent anything from procrastination to choosing a new hobby over your responsibilities. It's storytelling at its finest.</p>
                </div>

                 <div className="text-center pt-8">
                     <NavLink 
                        to="/create" 
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                    >
                        Feeling Inspired? Find These Templates Here!
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Top10MemeTemplates;
