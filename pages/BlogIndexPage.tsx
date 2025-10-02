
import React from 'react';
import { NavLink } from 'react-router-dom';

const blogPosts = [
    {
        slug: 'how-to-win-our-meme-contest',
        title: 'How to Win Our $100 Monthly Meme Contest',
        summary: 'Your ultimate guide to creating a qualifying meme, racking up votes, and giving yourself the best chance to win our cash prize.'
    },
    {
        slug: 'using-ai-to-create-memes',
        title: 'Unleash Your Creativity: Using AI to Create Memes',
        summary: 'Explore how our platform leverages cutting-edge AI to help you generate hilarious images, suggest witty captions, and remix templates instantly.'
    },
    {
        slug: 'what-makes-a-meme-go-viral',
        title: 'The Secret Sauce: What Makes a Meme Go Viral?',
        summary: 'We dive into the psychology of viral content, exploring the key ingredients of humor, relatability, and timing that turn a simple image into an internet phenomenon.'
    },
    {
        slug: 'how-to-make-a-meme',
        title: 'How to Make a Meme in Under 60 Seconds',
        summary: 'A step-by-step guide for beginners. Learn how to choose a template, write the perfect caption, and share your creation with the world.'
    },
    {
        slug: 'top-10-meme-templates',
        title: 'The Top 10 Meme Templates of All Time',
        summary: 'A trip down memory lane, looking at the most iconic meme templates that have shaped internet culture. Are your favorites on the list?'
    },
    {
        slug: 'meme-marketing-strategy',
        title: 'Meme Marketing: A Strategy for Viral Success',
        summary: 'Learn how businesses and brands are using memes to connect with younger audiences, create shareable content, and boost their online presence.'
    },
    {
        slug: 'history-of-memes',
        title: 'A Brief History of Memes: From Dancing Baby to AI',
        summary: 'Explore the evolution of internet memes, from the earliest email chains and forum jokes to the sophisticated, AI-generated content of today.'
    },
    {
        slug: 'fair-play-policy-explained',
        title: 'Fair Play and a Fun Community: Our Policy Explained',
        summary: 'Understand why we have a strict fair play policy, how we ensure a level playing field for the contest, and what it means for you as a creator.'
    }
];

const BlogIndexPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2 text-primary">The Meme Hub Blog</h1>
            <p className="text-center text-text-secondary mb-10">Your source for meme culture, contest tips, and viral strategies.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                    <div key={post.slug} className="bg-surface p-6 rounded-xl shadow-lg flex flex-col transition-transform transform hover:-translate-y-2">
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{post.title}</h2>
                        <p className="text-text-secondary flex-grow">{post.summary}</p>
                        <NavLink 
                            to={`/blog/${post.slug}`} 
                            className="mt-6 text-primary font-bold hover:underline self-start"
                        >
                            Read More →
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogIndexPage;
