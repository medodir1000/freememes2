import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    signIn: (email: string, pass: string) => Promise<any>;
    signUp: (username: string, email: string, pass: string) => Promise<any>;
    signInWithGoogle: () => Promise<any>;
    signOut: () => Promise<any>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    totalVotes: Number(profile.total_votes) || 0,
    memesCreated: Number(profile.memes_created) || 0,
    badge: profile.badge,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        /**
         * Fetches a user's profile, retrying a few times if it doesn't exist yet.
         * Throws an error on non-recoverable failures (e.g., RLS) or if all retries fail.
         */
        const fetchUserProfileWithRetry = async (session: Session, retries = 3, delay = 500): Promise<User> => {
            for (let i = 0; i < retries; i++) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (error) {
                    console.error("A non-retryable error occurred while fetching profile:", error);
                    throw error; // Throw to be caught by the caller
                }

                if (profile) {
                    return mapProfileToUser(profile); // Success
                }

                console.warn(`Profile not ready, attempt ${i + 1}/${retries}. Retrying...`);
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
            
            throw new Error("Failed to fetch user profile after all retries.");
        };
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                if (session) {
                    const userProfile = await fetchUserProfileWithRetry(session);
                    setUser(userProfile);
                    setSession(session);
                } else {
                    setUser(null);
                    setSession(null);
                }
            } catch (error) {
                console.error("Critical error during authentication process. Signing out.", error);
                // If fetching profile fails, sign out to prevent an inconsistent state.
                // The subsequent onAuthStateChange event will clear user/session state.
                await supabase.auth.signOut();
            } finally {
                setIsLoading(false);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);


    const signIn = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
    };
    
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
    };

    const signUp = async (username: string, email: string, pass: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    name: username,
                    avatar_url: `https://picsum.photos/seed/${username}/100`
                }
            }
        });

        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        user,
        session,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};