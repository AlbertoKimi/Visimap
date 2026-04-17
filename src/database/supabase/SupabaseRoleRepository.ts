import { supabase } from './client';
import { Rol } from "@/interfaces/Rol";
import { RoleRepository } from '../repositories/RoleRepository';

export class SupabaseRoleRepository implements RoleRepository {
  private static instance: SupabaseRoleRepository;

  private constructor() {}

  public static getInstance(): SupabaseRoleRepository {
    if (!SupabaseRoleRepository.instance) {
      SupabaseRoleRepository.instance = new SupabaseRoleRepository();
    }
    return SupabaseRoleRepository.instance;
  }

  async getAll(): Promise<Rol[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
