// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getUser, getProfile, signInWithGoogle, signOut } from './auth.js';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Função para atualizar o perfil (usada após pagamento)
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const userProfile = await getProfile(user.id);
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getProfile(currentUser.id);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setShowOnboarding(true);
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await getProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setShowOnboarding(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await signOut();
  };

  const completeOnboarding = (formData) => {
    setProfile({
      full_name: formData.fullName,
      birth_date: formData.birthDate,
      birth_city: formData.birthCity,
    });
    setShowOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      showOnboarding,
      login,
      logout,
      completeOnboarding,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
