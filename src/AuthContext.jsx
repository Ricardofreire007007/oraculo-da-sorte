// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { supabase, getUser, getProfile, signInWithGoogle, signOut } from './auth.js';
import { detectInAppBrowser } from './lib/inAppBrowser.js';
import InAppBrowserWarning from './components/InAppBrowserWarning.jsx';
import OnboardingPopup from './OnboardingPopup.jsx';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInAppWarning, setShowInAppWarning] = useState(false);

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
          if (!userProfile.birth_date || !userProfile.full_name) {
            setShowOnboarding(true);
          }
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
            if (!userProfile.birth_date || !userProfile.full_name) {
              setShowOnboarding(true);
            } else {
              setShowOnboarding(false);
            }
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
    if (detectInAppBrowser()) {
      try { track('oraculo_inapp_detected'); } catch { /* analytics opcional */ }
      setShowInAppWarning(true);
      return;
    }
    await signInWithGoogle();
  };

  const proceedAnyway = async () => {
    setShowInAppWarning(false);
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
      location: formData.location || null,
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
      {showOnboarding && user && (
        <OnboardingPopup userId={user.id} onComplete={completeOnboarding} />
      )}
      <InAppBrowserWarning
        open={showInAppWarning}
        onClose={() => setShowInAppWarning(false)}
        onProceedAnyway={proceedAnyway}
      />
    </AuthContext.Provider>
  );
}
