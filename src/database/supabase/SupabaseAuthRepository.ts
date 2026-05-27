import { supabase } from './client';
import { AuthRepository } from '../repositories/AuthRepository';

/**
 * Implementación concreta del AuthRepository utilizando el SDK de Supabase.
 * Sigue el patrón de diseño Singleton para garantizar una única instancia.
 */
export class SupabaseAuthRepository implements AuthRepository {
  private static instance: SupabaseAuthRepository;

  private constructor() { }

  public static getInstance(): SupabaseAuthRepository {
    if (!SupabaseAuthRepository.instance) {
      SupabaseAuthRepository.instance = new SupabaseAuthRepository();
    }
    return SupabaseAuthRepository.instance;
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  async sendPasswordReset(email: string) {
    // Envía un correo de recuperación al usuario indicado. El enlace del
    // correo redirige al `redirectTo` con el fragmento `#type=recovery`
    // que App.tsx detecta para mostrar la pantalla EstablecerContrasena.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  async inviteUser(email: string, metadata: any) {
    const { error } = await supabase.functions.invoke('invite-user', {
      body: {
        email,
        options: {
          data: metadata,
          redirectTo: window.location.origin
        }
      }
    });
    if (error) {
      // Extraemos el mensaje de Supabase para poder mostrarlo al usuario.
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === 'function') {
        try {
          const body = await ctx.json();
          const detalle = body?.error || body?.message || body?.msg;
          if (detalle) {
            const lower = String(detalle).toLowerCase();
            if (
              lower.includes('already') ||
              lower.includes('exists') ||
              lower.includes('registered') ||
              lower.includes('duplicate') ||
              lower.includes('ya está') ||
              lower.includes('ya existe')
            ) {
              throw new Error('USER_ALREADY_EXISTS');
            }
            throw new Error(detalle);
          }
        } catch (parseErr: any) {
          if (parseErr?.message === 'USER_ALREADY_EXISTS') throw parseErr;
          // Si no podemos leer el cuerpo, el motivo de fallo más común en esta función
          // es que el correo ya esté registrado, así que asumimos ese caso.
          throw new Error('USER_ALREADY_EXISTS');
        }
      }
      throw error;
    }
  }
}
