import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

// Defines the shape of the authentication context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to manage user session and authentication state
  useEffect(() => {
    // Fetches the current session from Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listens for authentication state changes (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  // Handles user sign-in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Supabase handles password hashing and security. Passwords are never stored in plain text.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { user: data.user, error };
  };

  // Handles user sign-up
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    // Attempt to sign up the user with Supabase Auth
    // Supabase Auth manages secure password storage (hashing) and email verification processes.
    const { data, error } = await supabase.auth.signUp({ email, password });

    // If there's no error and a user object is returned from Supabase Auth
    if (!error && data.user) {
      // Security/Compliance Note: Storing user emails in a separate 'user_emails' table
      // allows for more flexible Row Level Security (RLS) policies and granular data access,
      // separating authentication concerns from specific user data storage.
      const { error: insertError } = await supabase
        .from('user_emails')
        .insert([{ id: data.user.id, email: data.user.email }]);

      if (insertError) {
        console.error('Error inserting user email into user_emails table:', insertError);
        // Security/Compliance Note: If inserting into user_emails fails, consider logging this event
        // for auditing. Depending on requirements, robust error handling here might involve
        // rolling back the auth user creation to prevent orphaned user records.
        setLoading(false);
        return { user: null, error: insertError };
      }
    }

    setLoading(false);
    return { user: data.user, error }; // Return the user data and any auth error
  };

  // Handles user sign-out
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
