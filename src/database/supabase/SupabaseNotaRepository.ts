import { supabase } from './client';
import { Nota } from "@/interfaces/Nota";
import { NotaRepository } from '../repositories/NotaRepository';

export class SupabaseNotaRepository implements NotaRepository {
  private static instance: SupabaseNotaRepository;

  private constructor() { }

  public static getInstance(): SupabaseNotaRepository {
    if (!SupabaseNotaRepository.instance) {
      SupabaseNotaRepository.instance = new SupabaseNotaRepository();
    }
    return SupabaseNotaRepository.instance;
  }

  async getNotasRecientes(): Promise<Nota[]> {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        id,
        titulo,
        contenido,
        creado_por,
        creado_en,
        estado,
        actualizado_en,
        asignado_a,
        creador:profiles!notas_creado_por_fkey (
          nombre,
          primer_apellido,
          avatar_url
        ),
        asignado:profiles!notas_asignado_a_fkey (
          nombre,
          primer_apellido,
          avatar_url
        )
      `)
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Solo se van las que están finalizadas
    const validNotas = (data as any[]).filter((nota: any) => {
      if (nota.estado === 'finalizada') {
        const dateToCheck = nota.actualizado_en ? new Date(nota.actualizado_en) : new Date(nota.creado_en);
        return dateToCheck >= sevenDaysAgo;
      }
      return true;
    });

    return validNotas;
  }

  async createNota(nota: Omit<Nota, 'id' | 'creado_en' | 'estado' | 'actualizado_en' | 'creador' | 'asignado' | 'profiles'>): Promise<Nota> {
    const { data, error } = await supabase
      .from('notas')
      .insert([{ ...nota, estado: 'normal' }])
      .select(`
        id,
        titulo,
        contenido,
        creado_por,
        creado_en,
        estado,
        actualizado_en,
        asignado_a,
        creador:profiles!notas_creado_por_fkey (
          nombre,
          primer_apellido,
          avatar_url
        ),
        asignado:profiles!notas_asignado_a_fkey (
          nombre,
          primer_apellido,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data as any;
  }

  async updateNota(id: string, updates: Partial<Nota>): Promise<Nota> {
    const dataToUpdate = { ...updates };

    // Si cambia de estado, actualizamos la hora
    if (dataToUpdate.estado) {
      dataToUpdate.actualizado_en = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('notas')
      .update(dataToUpdate)
      .eq('id', id)
      .select(`
        id,
        titulo,
        contenido,
        creado_por,
        creado_en,
        estado,
        actualizado_en,
        asignado_a,
        creador:profiles!notas_creado_por_fkey (
          nombre,
          primer_apellido,
          avatar_url
        ),
        asignado:profiles!notas_asignado_a_fkey (
          nombre,
          primer_apellido,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data as any;
  }

  async deleteNota(id: string): Promise<void> {
    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
