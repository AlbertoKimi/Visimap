import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { AuthState } from "@/interfaces/Auth";
import { Perfil } from "@/interfaces/Perfil";

/**
 * Hook personalizado para acceder y mutar el estado global de autenticación.
 * 
 * Utiliza Zustand para la gestión del estado y el middleware 'persist' para
 * guardar automáticamente la sesión en el `localStorage` del navegador.
 * Esto permite mantener al usuario conectado aunque recargue la página.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set: (state: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void) => ({
      session: null,
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: true,

      setSession: (session: Session | null) => {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
          isLoading: false,
        });
      },

      setUserProfile: (profile: Perfil | null) => {
        set({ userProfile: profile });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      clearSession: () => {
        set({
          session: null,
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'visimap-auth-storage',
      storage: createJSONStorage(() => localStorage),

      partialize: (state: AuthState) => ({
        session: state.session,
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
