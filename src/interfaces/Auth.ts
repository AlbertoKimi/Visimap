import { Session, User } from '@supabase/supabase-js';
import { Perfil } from './Perfil';

/**
 * Agrupa la información del usuario autenticado en Supabase y su perfil en la base de datos.
 */
export interface SessionUser {
  /** Usuario base proporcionado por Supabase Auth */
  user: User | null;
  /** Perfil extendido del usuario desde la tabla 'perfiles' */
  profile: Perfil | null;
}

/**
 * Define el estado global de autenticación utilizado por Zustand (authStore).
 * Contiene los datos de sesión y las funciones para modificarlos.
 */
export interface AuthState {
  /** Sesión actual de Supabase */
  session: Session | null;
  /** Objeto de usuario autenticado de Supabase */
  user: User | null;
  /** Perfil detallado del usuario (rol, nombre, etc.) */
  userProfile: Perfil | null;
  /** Indicador booleano de si hay un usuario logueado */
  isAuthenticated: boolean;
  /** Indicador de estado de carga durante las peticiones de autenticación */
  isLoading: boolean;
  /** Establece o actualiza la sesión actual */
  setSession: (session: Session | null) => void;
  /** Establece o actualiza el perfil extendido del usuario */
  setUserProfile: (profile: Perfil | null) => void;
  /** Modifica el estado de carga */
  setLoading: (isLoading: boolean) => void;
  /** Limpia completamente la sesión y el estado local (Logout) */
  clearSession: () => void;
}
