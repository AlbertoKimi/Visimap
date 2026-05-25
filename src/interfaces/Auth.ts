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
  /**
   * `true` mientras se está validando el perfil tras un login (o tras restaurar
   * sesión al cargar la página). Permite a las rutas mostrar un spinner durante
   * ese hueco entre "sesión creada en Supabase Auth" y "perfil validado en la BD",
   * evitando el parpadeo del dashboard cuando un usuario desactivado intenta entrar.
   */
  isCheckingProfile: boolean;
  /**
   * Mensaje que explica por qué la última sesión fue rechazada o cerrada.
   * Se usa para mostrar feedback al usuario en el FormularioSesion (p.ej. cuenta
   * desactivada o perfil no encontrado) en lugar de un error genérico.
   */
  authError: string | null;
  /** Establece o actualiza la sesión actual */
  setSession: (session: Session | null) => void;
  /** Establece o actualiza el perfil extendido del usuario */
  setUserProfile: (profile: Perfil | null) => void;
  /** Modifica el estado de carga */
  setLoading: (isLoading: boolean) => void;
  /** Marca si se está validando el perfil tras un login */
  setCheckingProfile: (checking: boolean) => void;
  /** Establece o limpia un mensaje de error de autenticación */
  setAuthError: (mensaje: string | null) => void;
  /** Limpia completamente la sesión y el estado local (Logout) */
  clearSession: () => void;
}
