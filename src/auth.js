// src/auth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };

// Login com Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) console.error('Erro no login:', error);
  return { data, error };
};

// Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Erro no logout:', error);
};

// Obter utilizador atual
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Obter perfil do utilizador
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') console.error('Erro ao buscar perfil:', error);
  return data;
};

// Salvar perfil do utilizador
export const saveProfile = async (userId, profile) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: profile.fullName,
      birth_date: profile.birthDate,
      birth_city: profile.birthCity,
      updated_at: new Date().toISOString(),
    });
  if (error) console.error('Erro ao salvar perfil:', error);
  return { data, error };
};