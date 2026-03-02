import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kwltpijqcxgsajencvrf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z4nNNvQNJ6YYFQqkgOokUg_NTzmxM07';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);