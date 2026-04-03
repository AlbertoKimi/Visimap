import { Session, User } from '@supabase/supabase-js';
import { Perfil } from './Perfil';

export interface SessionUser {
  user: User | null;
  profile: Perfil | null;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  userProfile: Perfil | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUserProfile: (profile: Perfil | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
}
