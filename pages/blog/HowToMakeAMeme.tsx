
import React from 'react';
import { NavLink } from 'react-router-dom';
import Adsense from '../../components/Adsense';

const HowToMakeAMeme: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-xl shadow-lg text-text-secondary leading-relaxed">
            <h1 className="text-4xl font-bold text-primary mb-6">How to Make a Meme in Under 60 Seconds</h1>
            
            <div className="space-y-6">
                <p>Ever had a brilliant, funny idea but didn't know how to turn it into a meme? You've come to the right place! Our meme generator is designed to be fast, easy, and powerful. Follow these simple steps to create your first masterpiece and start collecting votes.</p>

                <Adsense adSlot="7890123456" adFormat="fluid" />

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Step 1: Choose Your Canvas</h2>
                <p>Every great meme starts with a great image or video. On our <NavLink to="/create" className="text-primary hover:underline">Create Page</NavLink>, you have several options:</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <strong className="text-text-primary">Use a Template:</strong> We have a massive, searchable library of popular meme templates. Just scroll through or search for a specific one like "Distracted Boyfriend" or "Drake Hotline Bling." This is the classic way to make a meme.
                    </li>
                    <li>
                        <strong className="text-text-primary">Upload Your Own Image:</strong> Have a funny photo of your pet or a screenshot from a movie? Use the 'Upload' tab to use your own image as the background.
                    </li>
                    <li>
                        <strong className="text-text-primary">Generate an Image with AI:</strong> Don't have the perfect image? No problem! Go to the 'Image with AI' tab and describe what you want. Be creative! Try "A cat programmer stressed about a deadline" or "A raccoon eating a birthday cake."
                    </li>
                    <li>
                        <strong className="text-text-primary">Generate a Video with AI:</strong> Take it to the next level by generating a short video clip. Use the 'Video with AI' tab and describe a funny scene.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Step 2: Write the Perfect Caption</h2>
                <p>The text is what gives a meme its context and punchline. You'll see input boxes for "Top Text" and "Bottom Text." Here are a few tips:</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                    <li>
                        <strong className="text-text-primary">Keep it Short & Sweet:</strong> The best meme captions are concise and easy to read quickly.
                    </li>
                    <li>
                        <strong className="text-text-primary">Be Relatable:</strong> Think about common, everyday frustrations or funny situations that many people experience.
                    </li>
                    <li>
                        <strong className="text-text-primary">Stuck? Use AI Suggestions:</strong> If you're using a template or an AI-generated image, you can use our 'Suggest Captions' feature. Our AI will analyze the image and give you several hilarious ideas to get you started.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Step 3: (Optional) Remix with AI</h2>
                <p>Want to add a little something extra to your image? Our 'Remix Image with AI' tool is perfect for that. After selecting an image, you can give the AI a simple command like "add a party hat" or "make it look like an old photo." It's a powerful way to make a template your own.</p>

                <h2 className="text-2xl font-bold text-text-primary pt-4 border-t border-gray-600">Step 4: Publish and Share!</h2>
                <p>Once you're happy with your creation, hit the "Publish Meme" button. Your meme is now live! But your job isn't done. To qualify for our monthly prize, you need votes. Share your meme on social media using our easy share buttons for WhatsApp, Facebook, and Pinterest. Send it to your friends and family and watch the votes roll in!</p>
            </div>
        </div>
    );
};

export default HowToMakeAMeme;
