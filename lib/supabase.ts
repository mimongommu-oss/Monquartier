import { createClient } from '@supabase/supabase-js';

// Configuration explicite pour garantir la connexion immédiate
const SUPABASE_URL = 'https://wkrvouxsjbmnmtgwdfac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcnZvdXhzamJtbm10Z3dkZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzQxMjIsImV4cCI6MjA4MTE1MDEyMn0.I1w5aajTLz3GjUXQDwOglMEZ1awXZHBLlsS4Rsu1kSA';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    return '';
  }
  return '';
}

// Priorité aux variables d'env, sinon fallback sur les clés hardcodées fournies
const url = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || SUPABASE_URL;
const key = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

let client;
let configured = false;

try {
  if (url && key && url.startsWith('http')) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    configured = true;
  } else {
    console.warn("⚠️ Supabase Credentials Invalid or Missing.");
    // Fallback dummy client pour éviter le crash immédiat au chargement
    throw new Error("Invalid Configuration");
  }
} catch (e) {
  console.error("Supabase Client Init Error:", e);
  // Client factice qui ne plante pas mais logue des erreurs
  client = createClient('https://placeholder.supabase.co', 'placeholder', { auth: { persistSession: false }});
}

export const supabase = client;
export const isSupabaseConfigured = () => configured;