import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile row from the `profiles` table by user id
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Error fetching profile:', error.message);
      return null;
    }
    return data;
  }

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }
      setLoading(false);
    });

    // 2. Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        // Only set loading false here if we were still loading (covers edge cases)
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // signUp: creates auth user + updates the profiles row with grade & school
  const signUp = async (email, password, fullName, grade, school) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
          grade,
          school,
        },
      },
    });

    if (error) return { error };

    return { data };
  };

  // signIn: standard email/password login
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // signOut: clears Supabase session
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[AuthContext] Sign-out error:', error.message);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
