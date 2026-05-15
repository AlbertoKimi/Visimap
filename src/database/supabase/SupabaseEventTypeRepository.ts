import { supabase } from './client';
import { TipoEvento } from "@/interfaces/Evento";
import { EventTypeRepository } from '../repositories/EventTypeRepository';

/**
 * Implementación concreta del EventTypeRepository utilizando el cliente Supabase.
 */
export class SupabaseEventTypeRepository implements EventTypeRepository {
  private static instance: SupabaseEventTypeRepository;

  private constructor() {}

  public static getInstance(): SupabaseEventTypeRepository {
    if (!SupabaseEventTypeRepository.instance) {
      SupabaseEventTypeRepository.instance = new SupabaseEventTypeRepository();
    }
    return SupabaseEventTypeRepository.instance;
  }

  async getAll(): Promise<TipoEvento[]> {
    const { data, error } = await supabase
      .from('tipo_evento')
      .select('id_tipo, nombre')
      .order('nombre');

    if (error) throw error;
    return data || [];
  }
}
