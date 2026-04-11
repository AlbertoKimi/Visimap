import { supabase } from '../../supabase/client';
import { Perfil, UUID } from '../../interfaces/Perfil';
import { UserRepository, UserStats } from '../repositories/UserRepository';

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

  async getStats(id: UUID): Promise<UserStats> {
    try {
      // Conteo de eventos
      const resCountE = await supabase.from('evento').select('id_evento', { count: 'exact', head: true }).eq('id_usuario', id);

      // Conteo de registros (visitantes individuales + grupos)
      const [resCountR, resCountG] = await Promise.all([
        supabase.from('registro_visitante').select('id_registro', { count: 'exact', head: true }).eq('id_usuario', id),
        supabase.from('grupo_visitante').select('id_grupo, evento!inner(id_usuario)', { count: 'exact', head: true }).eq('evento.id_usuario', id)
      ]);

      // Obtener el último registro de cada tabla para la "Última Actividad"
      const [resLastE, resLastR, resLastG] = await Promise.all([
        supabase.from('evento').select('fecha_inicio').eq('id_usuario', id).order('id_evento', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('registro_visitante').select('creado_en').eq('id_usuario', id).order('id_registro', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('grupo_visitante').select('created_at, evento!inner(id_usuario)').eq('evento.id_usuario', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      let fechaFinal = 'Sin datos';

      const getFechaValida = (item: any, source: 'evento' | 'registro' | 'grupo') => {
        if (!item) return null;
        let fechaStr = null;
        if (source === 'evento') fechaStr = item.fecha_inicio;
        else if (source === 'registro') fechaStr = item.creado_en;
        else if (source === 'grupo') fechaStr = item.created_at;

        if (fechaStr) {
          const d = new Date(fechaStr);
          const ahora = new Date();
          if (!isNaN(d.getTime()) && d <= ahora) return d;
        }
        return null;
      };

      const d1 = getFechaValida(resLastE.data, 'evento');
      const d2 = getFechaValida(resLastR.data, 'registro');
      const d3 = getFechaValida(resLastG.data, 'grupo');

      const fechas = [d1, d2, d3].filter(f => f !== null) as Date[];
      if (fechas.length > 0) {
        const masReciente = fechas.reduce((a, b) => a > b ? a : b);
        fechaFinal = masReciente.toLocaleDateString('es-ES', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
      }

      return {
        eventos: resCountE.count || 0,
        registros: (resCountR.count || 0) + (resCountG.count || 0),
        ultimaActividad: fechaFinal
      };
    } catch (err) {
      console.error("Error cargando estadísticas en repositorio:", err);
      return { eventos: 0, registros: 0, ultimaActividad: 'Sin datos' };
    }
  }

  async uploadAvatar(id: UUID, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}
