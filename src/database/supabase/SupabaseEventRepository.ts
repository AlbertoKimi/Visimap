import { supabase } from './client';
import { Evento, EventoFormData, GrupoVisitante } from "@/interfaces/Evento";
import { EventRepository } from '../repositories/EventRepository';

export class SupabaseEventRepository implements EventRepository {
  private static instance: SupabaseEventRepository;

  private constructor() { }

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

  async create(event: EventoFormData, groups: GrupoVisitante[] = []): Promise<Evento> {
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

  async update(id: number, event: Partial<EventoFormData>, groups?: GrupoVisitante[]): Promise<void> {
    const { error } = await supabase
      .from('evento')
      .update(event)
      .eq('id_evento', id);

    if (error) throw error;

    if (groups) {
      // Eliminar grupos anteriores y re-insertar
      await supabase.from('grupo_visitante').delete().eq('id_evento', id);
      if (groups.length > 0) {
        const groupsToInsert = groups.map(g => ({ ...g, id_evento: id }));
        const { error: groupError } = await supabase
          .from('grupo_visitante')
          .insert(groupsToInsert);
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

  async getAllGrupoVisitantes(): Promise<any[]> {
    // Obtener grupos con los datos básicos del evento
    const { data: grupos, error: grupoError } = await supabase
      .from('grupo_visitante')
      .select('*, evento:id_evento(nombre_evento, id_usuario, descripcion)')
      .order('created_at', { ascending: false });

    if (grupoError) throw grupoError;
    if (!grupos || grupos.length === 0) return [];

    // Obtener IDs únicos de los usuarios que crearon los eventos
    const userIds = [...new Set(grupos.map(g => g.evento?.id_usuario).filter(id => id))];

    // Traer los perfiles de esos usuarios
    const { data: perfiles, error: perfError } = await supabase
      .from('profiles')
      .select('id, nombre_usuario, nombre, avatar_url')
      .in('id', userIds);

    if (perfError) {
      console.error('Error al cargar perfiles para eventos:', perfError);
      return grupos;
    }

    // Mapear perfiles por ID
    type PerfilBasico = { id: string; nombre_usuario: string; nombre: string; avatar_url: string };
    const perfilesMap = (perfiles as PerfilBasico[]).reduce<Record<string, PerfilBasico>>((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    return grupos.map(g => ({
      ...g,
      evento: {
        ...g.evento,
        perfil: perfilesMap[g.evento?.id_usuario] || null
      }
    }));
  }

  async deleteGrupoVisitante(id: number): Promise<void> {
    const { error } = await supabase
      .from('grupo_visitante')
      .delete()
      .eq('id_grupo', id);

    if (error) throw error;
  }

  async updateGrupoVisitante(id: number, num_visitantes: number): Promise<void> {
    const { error } = await supabase
      .from('grupo_visitante')
      .update({ num_visitantes })
      .eq('id_grupo', id);

    if (error) throw error;
  }

  async getGruposByEvento(id_evento: number): Promise<GrupoVisitante[]> {
    const { data, error } = await supabase
      .from('grupo_visitante')
      .select('*')
      .eq('id_evento', id_evento)
      .order('id_grupo');

    if (error) throw error;
    return data || [];
  }
}
