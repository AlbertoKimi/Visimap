/**
 * Representa el resumen mensual de visitas.
 * Utilizado para mostrar comparativas temporales en los gráficos de historial.
 */
export interface VisitaHistorial {
  /** Año del registro (ej: 2025) */
  anio: number;
  /** Mes del registro (1-12) */
  mes: number;
  /** Cantidad total de visitantes en ese mes y año */
  total: number;
}

/**
 * Representa un elemento individual en una lista de desglose.
 * Por ejemplo: "España -> 150", "Badajoz -> 45".
 */
export interface DesgloseItem {
  /** Nombre del lugar (Provincia o País) */
  nombre: string;
  /** Número total de visitantes provenientes de ese lugar */
  total: number;
}

/**
 * Interfaz temporal (Raw) para mapear el resultado directo de una
 * consulta Supabase agrupada por provincias antes de ser procesada.
 */
export interface RawProvResult {
  cantidad: number;
  provincia: { nombre_provincia: string } | null;
}

/**
 * Interfaz temporal (Raw) para mapear el resultado directo de una
 * consulta Supabase agrupada por países antes de ser procesada.
 */
export interface RawPaisResult {
  cantidad: number;
  pais: { nombre_pais: string } | null;
}
