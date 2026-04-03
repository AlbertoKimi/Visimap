import { supabase } from '../../supabase/client';
import { Evento, GrupoVisitante } from '../../interfaces/Evento';
import { EventRepository } from '../repositories/EventRepository';

export class SupabaseEventRepository implements EventRepository {
  private static instance: SupabaseEventRepository;

  private constructor() {}

  public static getInstance(): SupabaseEventRepository {
    if (!SupabaseEventRepository.instance) {
      SupabaseEventRepository.instance = new SupabaseEventRepository();
    }
    return SupabaseEventRepository.instance;
  }

  async getAll(): Promise<Evento[]> {
    const { data, error } = await supabase
      .from('evento')
      .select('*, tipo_evento(nombre)')
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async create(event: any, groups: GrupoVisitante[] = []): Promise<Evento> {
    const { data, error } = await supabase
      .from('evento')
      .insert([event])
      .select()
      .single();

    if (error) throw error;

    if (groups.length > 0) {
      const groupsToInsert = groups.map(g => ({ ...g, id_evento: data.id_evento }));
      const { error: groupError } = await supabase
        .from('grupo_visitante')
        .insert(groupsToInsert);
      if (groupError) throw groupError;
    }

    return data;
  }

  async update(id: number, event: any, groups?: GrupoVisitante[]): Promise<void> {
    const { error } = await supabase
      .from('evento')
      .update(event)
      .eq('id_evento', id);

    if (error) throw error;

    if (groups) {
      // Eliminar grupos anteriores y re-insertar
      await supabase.from('grupo_visitante').delete().eq('id_evento', id);
      if (groups.length > 0) {
        const { error: groupError } = await supabase
          .from('grupo_visitante')
          .insert(groups);
        if (groupError) throw groupError;
      }
    }
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('evento')
      .delete()
      .eq('id_evento', id);

    if (error) throw error;
  }

  async toggleFinalizado(id: number, finalizado: boolean): Promise<void> {
    const { error } = await supabase
      .from('evento')
      .update({ finalizado })
      .eq('id_evento', id);

    if (error) throw error;
  }
}
