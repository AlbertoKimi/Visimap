import { supabase } from '../../supabase/client';
import { Pais, Provincia, RegistroVisitante } from '../../interfaces/Visitor';
import { VisitorRepository } from '../repositories/VisitorRepository';

export class SupabaseVisitorRepository implements VisitorRepository {
  private static instance: SupabaseVisitorRepository;

  private constructor() {}

  public static getInstance(): SupabaseVisitorRepository {
    if (!SupabaseVisitorRepository.instance) {
      SupabaseVisitorRepository.instance = new SupabaseVisitorRepository();
    }
    return SupabaseVisitorRepository.instance;
  }

  async getPaisByName(name: string): Promise<Pais | null> {
    const { data, error } = await supabase
      .from('pais')
      .select('id_pais, nombre_pais')
      .ilike('nombre_pais', name.trim())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getProvinciaByName(name: string): Promise<Provincia | null> {
    const { data, error } = await supabase
      .from('provincia')
      .select('id_provincia, nombre_provincia')
      .ilike('nombre_provincia', name.trim())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createRegistro(registro: RegistroVisitante): Promise<void> {
    const { 
        id_pais, 
        id_provincia, 
        id_usuario, 
        cantidad, 
        tipo_visita, 
        observaciones 
    } = registro;

    const { error } = await supabase
      .from('registro_visitante')
      .insert([{
        id_pais,
        id_provincia,
        id_usuario,
        cantidad,
        tipo_visita,
        observaciones
      }]);

    if (error) throw error;
  }
}
