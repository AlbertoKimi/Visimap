import { supabase } from '../../supabase/client';
import { Perfil, UUID } from '../../interfaces/Perfil';
import { UserRepository } from '../repositories/UserRepository';

export class SupabaseUserRepository implements UserRepository {
  private static instance: SupabaseUserRepository;

  private constructor() {}

  public static getInstance(): SupabaseUserRepository {
    if (!SupabaseUserRepository.instance) {
      SupabaseUserRepository.instance = new SupabaseUserRepository();
    }
    return SupabaseUserRepository.instance;
  }

  async getAll(): Promise<Perfil[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(id: UUID): Promise<Perfil | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: UUID, profile: Partial<Perfil>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id);

    if (error) throw error;
  }

  async toggleStatus(id: UUID, status: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ active: status })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: UUID): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
