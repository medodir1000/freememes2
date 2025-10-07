import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Meme, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addComment as dbAddComment, getCommentsForMeme, castVote } from '../services/supabaseService';

interface MemeCardProps {
    meme: Meme;
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme, showNotification }) => {
    const [localVotes, setLocalVotes] = useState(meme.votes || 0);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [voted, setVoted] = useState<'up' | 'down' | null>(null);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setLocalVotes(meme.votes || 0);
    }, [meme.votes]);

    const handleVote = async (delta: 1 | -1) => {
        if (!user) {
            showNotification('You must be logged in to vote.', 'error');
            return;
        }

        const newVotedState = (delta === 1) ? 'up' : 'down';
        if (voted === newVotedState) return;

        // Store original state for potential rollback on error
        const originalVotes = localVotes;
        const originalVotedState = voted;

        const voteChange = voted === null ? delta : delta * 2;
        
        // Optimistic UI update
        setLocalVotes(prev => prev + voteChange);
        setVoted(newVotedState);
        
        try {
            const { newTotalVotes, milestoneMessage } = await castVote(meme.id, user.id, delta);

            // If the server returns a definitive new vote count, use it.
            // This syncs the state in case of discrepancies.
            if (newTotalVotes !== null) {
                setLocalVotes(newTotalVotes);
            }

            if (milestoneMessage) {
                showNotification(milestoneMessage, 'success');
                if(milestoneMessage.includes('2000 votes')) {
                    setTimeout(() => showNotification('🔥 Keep sharing your meme to secure your spot!', 'info'), 5500);
                }
            }
        } catch (error) {
            // Revert optimistic update on failure
            setLocalVotes(originalVotes);
            setVoted(originalVotedState);
            showNotification('Failed to cast vote. Please try again.', 'error');
            console.error("Error during vote operation:", error);
        }
    };

    const handleShareWhatsApp = () => {
        const shareUrl = `https://freememesgenerator.com/#/meme/${meme.id}`;
        const text = `Check out this meme I found on FreeMemesGenerator!`;
        const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)} ${encodeURIComponent(shareUrl)}`;
        window.open(whatsappShareUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShareFacebook = () => {
        const shareUrl = `https://freememesgenerator.com/#/meme/${meme.id}`;
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookShareUrl, '_blank', 'noopener,noreferrer');
    };

    const handleSharePinterest = () => {
        const shareUrl = `https://freememesgenerator.com/#/meme/${meme.id}`;
        const description = `Check out this meme from FreeMemesGenerator! Created by ${meme.creator.name}.`;
        const pinterestShareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(meme.imageUrl)}&description=${encodeURIComponent(description)}`;
        window.open(pinterestShareUrl, '_blank', 'noopener,noreferrer');
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            showNotification('You must be logged in to comment.', 'error');
            return;
        }
        if (newComment.trim() === '') {
            showNotification('Comment cannot be empty.', 'error');
            return;
        }
        try {
            const addedComment = await dbAddComment(meme.id, user.id, newComment);
            if(addedComment) {
                 setComments(prev => [addedComment, ...prev]);
                 setNewComment('');
                 showNotification('Comment posted!', 'success');
            }
        } catch(error) {
            showNotification('Failed to post comment.', 'error');
        }
    };

    const toggleComments = async () => {
        const willBeVisible = !commentsVisible;
        setCommentsVisible(willBeVisible);

        if (willBeVisible && comments.length === 0) {
            setIsLoadingComments(true);
            try {
                const fetchedComments = await getCommentsForMeme(meme.id);
                setComments(fetchedComments);
            } catch (error) {
                showNotification('Could not load comments.', 'error');
            } finally {
                setIsLoadingComments(false);
            }
        }
    }

    return (
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1">
            <div className="relative bg-black">
                {meme.mediaType === 'video' ? (
                    <video src={meme.imageUrl} className="w-full h-auto object-contain max-h-96" controls loop playsInline aria-label={`Meme by ${meme.creator.name}`}>
                        <track kind="captions" src="captions.vtt" srclang="en" label="English" />
                    </video>
                ) : (
                    <img src={meme.imageUrl} alt={`Meme by ${meme.creator.name}`} className="w-full h-auto object-contain max-h-96" loading="lazy" decoding="async" />
                )}
                {meme.topText && (
                    <div className="absolute top-0 left-0 right-0 p-2 text-center text-white font-bold text-xl md:text-2xl uppercase break-words pointer-events-none" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 4px black' }}>
                        {meme.topText}
                    </div>
                )}
                {meme.bottomText && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-white font-bold text-xl md:text-2xl uppercase break-words pointer-events-none" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 4px black' }}>
                        {meme.bottomText}
                    </div>
                )}
                {meme.mediaType === 'video' && (
                    <div className="absolute bottom-2 right-2 text-white text-xs opacity-60 font-sans pointer-events-none" style={{ textShadow: '1px 1px 2px black' }}>
                        freememesgenerator.com
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-text-secondary">By <span className="font-bold text-primary">{meme.creator.name}</span></p>
                    <span className="font-bold text-lg text-text-primary">{localVotes.toLocaleString()} Votes</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                     <button 
                        onClick={() => handleVote(1)} 
                        disabled={!user}
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${voted === 'up' ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-green-600'} disabled:bg-gray-700 disabled:cursor-not-allowed`}
                        aria-label="Good Meme"
                    >
                        👍 Good Meme
                    </button>
                    <button 
                        onClick={() => handleVote(-1)}
                        disabled={!user} 
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${voted === 'down' ? 'bg-red-500 text-white' : 'bg-gray-600 hover:bg-red-600'} disabled:bg-gray-700 disabled:cursor-not-allowed`}
                        aria-label="Bad Meme"
                    >
                        👎 Bad Meme
                    </button>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-700 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={handleShareWhatsApp} className="flex items-center justify-center space-x-2 w-full bg-[#25D366] hover:bg-[#1DAE54] text-white font-bold py-2 px-4 rounded-lg transition-colors" aria-label="Share on WhatsApp">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.501-.183-.001-.381-.001-.579-.001-.198 0-.521.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.078 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </button>
                         <button onClick={handleShareFacebook} className="flex items-center justify-center space-x-2 w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-2 px-4 rounded-lg transition-colors" aria-label="Share on Facebook">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                        </button>
                         <button onClick={handleSharePinterest} className="flex items-center justify-center space-x-2 w-full bg-[#E60023] hover:bg-[#B8001C] text-white font-bold py-2 px-4 rounded-lg transition-colors" aria-label="Share on Pinterest">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.054-3.334.272-1.017 1.827-7.734 1.827-7.734s-.469-.937-.469-2.327c0-2.186 1.258-3.824 2.827-3.824 1.326 0 1.966.996 1.966 2.192 0 1.322-.843 3.328-1.29 5.168-.373 1.537.766 2.797 2.28 2.797 2.71 0 4.797-2.873 4.797-6.93 0-3.582-2.586-6.195-6.217-6.195-4.228 0-6.727 3.14-6.727 6.227 0 1.227.49 2.545 1.107 3.305.123.15.143.278.107.444-.045.22-.15.612-.192.778-.053.22-.213.282-.43.196-1.522-.522-2.49-2.046-2.49-3.83 0-2.91 2.167-5.556 6.358-5.556 3.373 0 5.85 2.414 5.85 5.221 0 3.28-2.032 5.842-5.026 5.842-1.64 0-3.187-1.228-2.733-2.653.48-1.537 1.4-3.436 1.4-4.595 0-1.03-.547-1.92-1.528-1.92-1.278 0-2.292 1.32-2.292 2.707 0 1.065.343 1.828.343 1.828l-1.258 5.344c-.266 1.187-.998 2.62-1.495 3.368.199.08.407.13.612.13 3.427 0 6.25-3.14 6.25-6.912C20.445 6.905 16.438 0 12.017 0z"/>
                            </svg>
                        </button>
                    </div>
                    <div className="text-center">
                        <button onClick={toggleComments} className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span>{commentsVisible ? 'Hide' : `Show ${isLoadingComments ? '...' : comments.length}`} Comments</span>
                        </button>
                    </div>
                </div>
                {commentsVisible && (
                    <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
                        {user ? (
                            <form onSubmit={handlePostComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-grow p-2 bg-background rounded-md border-2 border-surface focus:border-primary focus:outline-none text-sm"
                                />
                                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 rounded-md text-sm">Post</button>
                            </form>
                        ) : (
                            <div className="text-center bg-background p-3 rounded-lg">
                                <p className="text-text-secondary mb-3">Want to join the conversation?</p>
                                <div className="flex gap-2 justify-center">
                                    <NavLink to="/signin" className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-md text-sm">Sign In</NavLink>
                                    <NavLink to="/signup" className="bg-secondary hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md text-sm">Sign Up</NavLink>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {isLoadingComments ? <p className="text-sm text-text-secondary text-center">Loading comments...</p> : (
                                comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.id} className="bg-background p-2 rounded-md">
                                            <p className="text-sm text-text-primary"><strong className="text-primary">{comment.author.name}:</strong> {comment.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-text-secondary text-center">No comments yet. Be the first!</p>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemeCard;