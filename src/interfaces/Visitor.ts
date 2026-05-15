/**
 * Representa un país de origen en el registro de visitas.
 */
export interface Pais {
  id_pais: number;
  nombre_pais: string;
}

/**
 * Representa una provincia española de origen en el registro de visitas.
 */
export interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

/**
 * Interfaz principal para el registro individual o grupal de visitantes "corrientes"
 * (no asociados a un evento específico).
 */
export interface RegistroVisitante {
  /** Identificador único autoincremental */
  id_registro?: number;
  /** ID del país de procedencia */
  id_pais: number;
  /** ID de la provincia de procedencia (null si es extranjero) */
  id_provincia: number | null;
  /** UUID del trabajador/admin que realizó el registro */
  id_usuario: string;
  /** Número de personas en esta visita */
  cantidad: number;
  /** Clasificación básica del tamaño de la visita */
  tipo_visita: 'individual' | 'grupo';
  /** Anotaciones extra (opcional) */
  observaciones: string | null;
  /** Fecha de creación en base de datos */
  created_at?: string;
}

/**
 * Vista detallada de un registro de visitantes, enriquecida con los nombres
 * de provincia, país y perfil del usuario mediante Joins de Supabase.
 * Utilizada principalmente en la tabla de datos del componente Mapa.
 */
export interface RegistroMapa {
  /** ID original del registro */
  id_registro: number;
  /** Número de personas */
  cantidad: number;
  /** 'individual' o 'grupo' */
  tipo_visita: 'individual' | 'grupo';
  /** Timestamp de creación */
  creado_en: string;
  /** Objeto anidado con el nombre de la provincia (si existe) */
  provincia?: { nombre_provincia: string };
  /** Objeto anidado con el nombre del país (si existe) */
  pais?: { nombre_pais: string };
  /** Datos del trabajador que hizo el registro */
  perfil?: { nombre_usuario?: string; nombre?: string; avatar_url?: string };
  /** Permite campos adicionales generados dinámicamente por la vista SQL */
  [key: string]: unknown;
}
