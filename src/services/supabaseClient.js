import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables. ' +
    'Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY ' +
    'are defined in your .env file and that you have restarted the dev server.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
