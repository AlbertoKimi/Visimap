import { supabase } from './client';
import { Pais, Provincia } from "@/interfaces/Visitor";
import {
  StatsRepository,
  RegistroVisitanteRow,
  GrupoVisitanteRow,
  EventoRow,
  VistaVisitantesTotalesRow,
  PerfilActivoRow,
} from '../repositories/StatsRepository';

/**
 * Mapa de perfiles de selección a las columnas que se piden a Supabase.
 * Centralizar aquí evita repetir literales SQL en distintos métodos.
 */
const SELECCION_REGISTROS: Record<string, string> = {
  cantidad: 'cantidad',
  cantidadFecha: 'cantidad, creado_en',
  cantidadFechaPais: 'cantidad, creado_en, id_pais',
  cantidadFechaTipo: 'cantidad, creado_en, tipo_visita',
  cantidadProvinciaPais: 'cantidad, provincia:id_provincia(nombre_provincia), pais:id_pais(nombre_pais)',
  cantidadFechaProvinciaPais: 'cantidad, creado_en, provincia:id_provincia(nombre_provincia), pais:id_pais(nombre_pais)',
  cantidadPais: 'cantidad, pais:id_pais(nombre_pais)',
  idUsuario: 'id_usuario',
};

/**
 * Implementación Supabase del repositorio de estadísticas analíticas.
 *
 * Encapsula todas las consultas de solo lectura usadas por:
 *  - El asistente IA (hooks/useChatIA.ts)
 *  - Los gráficos del panel (components/app/graficos/GraficosPanel.tsx)
 *  - La página de historial (pages/Historial.tsx)
 *
 * Sigue el patrón Singleton consistente con el resto de SupabaseXxxRepository.
 */
export class SupabaseStatsRepository implements StatsRepository {
  private static instance: SupabaseStatsRepository;

  private constructor() {}

  public static getInstance(): SupabaseStatsRepository {
    if (!SupabaseStatsRepository.instance) {
      SupabaseStatsRepository.instance = new SupabaseStatsRepository();
    }
    return SupabaseStatsRepository.instance;
  }

  // ── Catálogos ──────────────────────────────────────────────────────────────

  async getProvincias(): Promise<Provincia[]> {
    const { data, error } = await supabase
      .from('provincia')
      .select('id_provincia, nombre_provincia');

    if (error) throw error;
    return data || [];
  }

  async getPaises(): Promise<Pais[]> {
    const { data, error } = await supabase
      .from('pais')
      .select('id_pais, nombre_pais');

    if (error) throw error;
    return data || [];
  }

  // ── Registros de visitantes ───────────────────────────────────────────────

  async getRegistrosVisitante(opts: {
    inicio?: string;
    fin?: string;
    tipo?: 'individual' | 'grupo';
    idProvincia?: number;
    idPais?: number;
    idPaisNot?: number;
    seleccion?: keyof typeof SELECCION_REGISTROS;
  }): Promise<RegistroVisitanteRow[]> {
    const columnas = SELECCION_REGISTROS[opts.seleccion || 'cantidadFecha'];

    let query = supabase
      .from('registro_visitante')
      .select(columnas);

    if (opts.inicio) query = query.gte('creado_en', opts.inicio);
    if (opts.fin) query = query.lte('creado_en', opts.fin);
    if (opts.tipo) query = query.eq('tipo_visita', opts.tipo);
    if (opts.idProvincia !== undefined) query = query.eq('id_provincia', opts.idProvincia);
    if (opts.idPais !== undefined) query = query.eq('id_pais', opts.idPais);
    if (opts.idPaisNot !== undefined) query = query.neq('id_pais', opts.idPaisNot);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as RegistroVisitanteRow[];
  }

  // ── Grupos de visitantes (eventos) ────────────────────────────────────────

  async getGruposEnRango(opts: {
    inicio?: string;
    fin?: string;
    tipoOrigen?: 'provincia' | 'pais';
    origen?: string;
    idsEvento?: number[];
    incluirCategoria?: boolean;
  }): Promise<GrupoVisitanteRow[]> {
    const necesitaJoinEvento = !!(opts.inicio || opts.fin || opts.incluirCategoria);

    let columnas = 'num_visitantes, tipo_origen, origen, id_evento';
    if (necesitaJoinEvento) {
      const eventoSelect = opts.incluirCategoria
        ? 'evento!inner ( fecha_inicio, nombre_evento, tipo_evento ( nombre ) )'
        : 'evento!inner ( fecha_inicio, nombre_evento )';
      columnas = `${columnas}, ${eventoSelect}`;
    }

    let query = supabase
      .from('grupo_visitante')
      .select(columnas);

    if (opts.inicio) query = query.gte('evento.fecha_inicio', opts.inicio);
    if (opts.fin) query = query.lte('evento.fecha_inicio', opts.fin);
    if (opts.tipoOrigen) query = query.eq('tipo_origen', opts.tipoOrigen);
    if (opts.origen !== undefined) query = query.eq('origen', opts.origen);
    if (opts.idsEvento && opts.idsEvento.length > 0) query = query.in('id_evento', opts.idsEvento);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as GrupoVisitanteRow[];
  }

  async getVisitantesPorEventos(idsEvento: number[]): Promise<Record<number, number>> {
    if (idsEvento.length === 0) return {};

    const { data, error } = await supabase
      .from('grupo_visitante')
      .select('id_evento, num_visitantes')
      .in('id_evento', idsEvento);

    if (error) throw error;

    const mapa: Record<number, number> = {};
    (data || []).forEach((g: any) => {
      if (g.id_evento != null) {
        mapa[g.id_evento] = (mapa[g.id_evento] || 0) + (g.num_visitantes || 0);
      }
    });
    return mapa;
  }

  // ── Eventos ───────────────────────────────────────────────────────────────

  async getEventos(opts?: {
    inicio?: string;
    fin?: string;
    soloActivos?: boolean;
  }): Promise<EventoRow[]> {
    let query = supabase
      .from('evento')
      .select('id_evento, nombre_evento, fecha_inicio, finalizado')
      .order('fecha_inicio', { ascending: true });

    if (opts?.inicio) query = query.gte('fecha_inicio', opts.inicio);
    if (opts?.fin) query = query.lte('fecha_inicio', opts.fin);
    if (opts?.soloActivos) query = query.neq('finalizado', true);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as EventoRow[];
  }

  async getEventosUsuariosPorPeriodo(inicio: string, fin: string): Promise<{ id_usuario: string }[]> {
    const { data, error } = await supabase
      .from('evento')
      .select('id_usuario')
      .gte('fecha_inicio', inicio)
      .lte('fecha_inicio', fin);

    if (error) throw error;
    return (data || []) as { id_usuario: string }[];
  }

  // ── Vista materializada ───────────────────────────────────────────────────

  async getVistaVisitantesTotales(): Promise<VistaVisitantesTotalesRow[]> {
    const { data, error } = await supabase
      .from('vista_visitantes_totales')
      .select('total_personas, fecha, origen');

    if (error) throw error;
    return (data || []) as VistaVisitantesTotalesRow[];
  }

  // ── Personal y notas ──────────────────────────────────────────────────────

  async getPerfilesActivos(): Promise<PerfilActivoRow[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, nombre_usuario')
      .eq('active', true);

    if (error) throw error;
    return (data || []) as PerfilActivoRow[];
  }

  async getNotasUsuariosPorPeriodo(inicio: string, fin: string): Promise<{ creado_por: string }[]> {
    const { data, error } = await supabase
      .from('notas')
      .select('creado_por')
      .gte('creado_en', inicio)
      .lte('creado_en', fin);

    if (error) throw error;
    return (data || []) as { creado_por: string }[];
  }
}
