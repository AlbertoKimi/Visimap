import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Estas constantes leen automáticamente los valores de tu archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exportamos la conexión para usarla en toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);