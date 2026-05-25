import { Pais, Provincia } from "@/interfaces/Visitor";

/**
 * Fila bruta de un registro de visitante con sus joins opcionales.
 * Usada por consultas analíticas (asistente IA, gráficos, historial).
 */
export interface RegistroVisitanteRow {
  cantidad: number;
  creado_en?: string;
  tipo_visita?: 'individual' | 'grupo';
  id_pais?: number;
  id_provincia?: number | null;
  id_usuario?: string;
  provincia?: { nombre_provincia: string } | null;
  pais?: { nombre_pais: string } | null;
}

/**
 * Fila bruta de un grupo de visitantes con su evento opcional.
 */
export interface GrupoVisitanteRow {
  num_visitantes: number;
  tipo_origen?: 'provincia' | 'pais';
  origen?: string;
  id_evento?: number;
  evento?: {
    fecha_inicio: string;
    nombre_evento?: string;
    tipo_evento?: { nombre: string } | null;
  } | null;
}

/**
 * Fila bruta de un evento (analítica, no CRUD).
 */
export interface EventoRow {
  id_evento: number;
  nombre_evento: string;
  fecha_inicio: string;
  finalizado: boolean;
  id_usuario?: string;
}

/**
 * Fila de la vista materializada vista_visitantes_totales.
 */
export interface VistaVisitantesTotalesRow {
  total_personas: number;
  fecha: string;
  origen?: string;
}

/**
 * Perfil mínimo activo (id + nombres). Para cálculo de rendimiento.
 */
export interface PerfilActivoRow {
  id: string;
  nombre: string | null;
  nombre_usuario: string | null;
}

/**
 * Contrato para el repositorio de estadísticas analíticas.
 *
 * Centraliza todas las consultas de solo lectura usadas por el asistente IA,
 * los gráficos del panel y la página de historial. Mantiene los componentes
 * desacoplados del cliente Supabase (siguiendo el patrón Repository ya
 * establecido en VisitorRepository, EventRepository, etc.).
 */
export interface StatsRepository {
  // ── Catálogos ──────────────────────────────────────────────────────────────

  /** Devuelve el catálogo completo de provincias (id + nombre). */
  getProvincias(): Promise<Provincia[]>;

  /** Devuelve el catálogo completo de países (id + nombre). */
  getPaises(): Promise<Pais[]>;

  // ── Registros de visitantes (ventanilla) ──────────────────────────────────

  /**
   * Obtiene los registros de visitante (ventanilla) que cumplan los filtros.
   * Si se omiten `inicio` y `fin` se devuelven TODOS los registros (uso histórico).
   * @param opts.inicio - Fecha ISO inicial (inclusive) para `creado_en`.
   * @param opts.fin - Fecha ISO final (inclusive) para `creado_en`.
   * @param opts.tipo - Filtra por `tipo_visita` (individual / grupo).
   * @param opts.idProvincia - Filtra por `id_provincia` exacto.
   * @param opts.idPais - Filtra por `id_pais` exacto.
   * @param opts.idPaisNot - Filtra registros con `id_pais != idPaisNot`.
   * @param opts.seleccion - Conjunto de columnas (perfil de carga).
   */
  getRegistrosVisitante(opts: {
    inicio?: string;
    fin?: string;
    tipo?: 'individual' | 'grupo';
    idProvincia?: number;
    idPais?: number;
    idPaisNot?: number;
    seleccion?:
      | 'cantidad'
      | 'cantidadFecha'
      | 'cantidadFechaPais'
      | 'cantidadFechaTipo'
      | 'cantidadProvinciaPais'
      | 'cantidadFechaProvinciaPais'
      | 'cantidadPais'
      | 'idUsuario';
  }): Promise<RegistroVisitanteRow[]>;

  // ── Grupos de visitantes (eventos) ────────────────────────────────────────

  /**
   * Obtiene los grupos de visitantes asociados a eventos en un rango de fechas
   * (`evento.fecha_inicio` entre `inicio` y `fin`).
   * Si se omiten `inicio` y `fin` devuelve TODOS los grupos sin hacer el join (uso histórico).
   * @param opts.tipoOrigen - Filtra por origen (provincia o pais).
   * @param opts.origen - Filtra por valor literal del origen.
   * @param opts.idsEvento - Restringe a un conjunto de eventos.
   * @param opts.incluirCategoria - Incluye `tipo_evento.nombre` en el join.
   */
  getGruposEnRango(opts: {
    inicio?: string;
    fin?: string;
    tipoOrigen?: 'provincia' | 'pais';
    origen?: string;
    idsEvento?: number[];
    incluirCategoria?: boolean;
  }): Promise<GrupoVisitanteRow[]>;

  /**
   * Suma de `num_visitantes` por `id_evento` para una lista de eventos.
   * Devuelve un mapa { id_evento: totalVisitantes }.
   */
  getVisitantesPorEventos(idsEvento: number[]): Promise<Record<number, number>>;

  // ── Eventos ───────────────────────────────────────────────────────────────

  /**
   * Lista eventos según filtros opcionales.
   * @param opts.inicio - Rango inferior para `fecha_inicio` (inclusive).
   * @param opts.fin - Rango superior para `fecha_inicio` (inclusive).
   * @param opts.soloActivos - Si true, excluye los eventos finalizados.
   */
  getEventos(opts?: {
    inicio?: string;
    fin?: string;
    soloActivos?: boolean;
  }): Promise<EventoRow[]>;

  /**
   * Obtiene los `id_usuario` de cada evento creado dentro de un rango.
   * Usado para el cómputo de rendimiento del personal.
   */
  getEventosUsuariosPorPeriodo(inicio: string, fin: string): Promise<{ id_usuario: string }[]>;

  // ── Vista materializada de totales ────────────────────────────────────────

  /**
   * Devuelve todas las filas de la vista `vista_visitantes_totales`.
   * Usado para totales históricos, evolución diaria y resúmenes mensuales.
   */
  getVistaVisitantesTotales(): Promise<VistaVisitantesTotalesRow[]>;

  // ── Personal / Notas ──────────────────────────────────────────────────────

  /** Perfiles activos (id + nombres). */
  getPerfilesActivos(): Promise<PerfilActivoRow[]>;

  /**
   * Obtiene los `creado_por` de cada nota creada dentro de un rango.
   * Usado para el cómputo de rendimiento del personal.
   */
  getNotasUsuariosPorPeriodo(inicio: string, fin: string): Promise<{ creado_por: string }[]>;
}
