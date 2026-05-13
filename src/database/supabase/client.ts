/**
 * Instancia global del cliente de Supabase.
 * Se inicializa utilizando las variables de entorno de Vite.
 * Sirve como único punto de conexión a la base de datos para toda la aplicación.
 * @module
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
