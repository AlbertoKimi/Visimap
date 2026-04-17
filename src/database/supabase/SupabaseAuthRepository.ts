import { supabase } from './client';
import { AuthRepository } from '../repositories/AuthRepository';

export class SupabaseAuthRepository implements AuthRepository {
  private static instance: SupabaseAuthRepository;

  private constructor() {}

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

  onAuthStateChange(callback: (event: string, session: any) => void) {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  async inviteUser(email: string, metadata: any) {
    const { error } = await supabase.functions.invoke('invite-user', {
      body: {
        email,
        options: { data: metadata }
      }
    });
    if (error) throw error;
  }
}
