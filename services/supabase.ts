import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kwltpijqcxgsajencvrf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z4nNNvQNJ6YYFQqkgOokUg_NTzmxM07';

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('sb_publishable')) {
  console.warn("Atenção: A chave do Supabase (SUPABASE_ANON_KEY) parece estar incorreta ou é uma chave do Stripe. Verifique suas variáveis de ambiente.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);