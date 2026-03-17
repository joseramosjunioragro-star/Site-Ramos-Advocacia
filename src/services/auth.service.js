import { supabase, isSupabaseEnabled } from '../lib/supabase';

export async function signIn(email, password) {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseEnabled) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

/**
 * Send a password-reset email.
 * Supabase will redirect the user to {origin}/reset-password after clicking the link.
 */
export async function sendPasswordReset(email) {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}
