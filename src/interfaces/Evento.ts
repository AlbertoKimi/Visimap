/** Alias para Identificadores Únicos Universales */
export type UUID = string;

/**
 * Representa una Exposición, Taller o Actividad programada en el Museo.
 */
export interface Evento {
  /** Identificador único autoincremental del evento */
  id_evento: number;
  /** Título oficial del evento */
  nombre_evento: string;
  /** Descripción detallada opcional del evento */
  descripcion?: string;
  /** Fecha y hora de inicio (formato ISO) */
  fecha_inicio: string;
  /** Fecha y hora de finalización (formato ISO) */
  fecha_fin: string;
  /** ID de la categoría o tipo de evento (ej: Exposición, Charla) */
  id_tipo: number;
  /** UUID del usuario (trabajador/admin) que creó el evento */
  id_usuario: UUID;
  /** Estado del evento (true = terminado, false = activo/próximo) */
  finalizado: boolean;
  /** Fecha de registro en la base de datos */
  created_at?: string;
  /** Relación (Join) con la tabla de tipos de evento para mostrar el nombre directamente */
  tipo_evento?: {
    nombre: string;
  };
}

/**
 * Categorías disponibles para clasificar los eventos.
 */
export interface TipoEvento {
  /** Identificador único del tipo */
  id_tipo: number;
  /** Nombre de la categoría (ej: 'Exposición Temporal') */
  nombre: string;
}

/**
 * Representa un registro de asistencia agrupado a un evento concreto.
 */
export interface GrupoVisitante {
  /** Identificador único del registro de grupo */
  id_grupo?: number;
  /** ID del evento al que asistieron */
  id_evento: number;
  /** Nivel geográfico del origen (provincia española o país extranjero) */
  tipo_origen: 'provincia' | 'pais';
  /** Nombre de la provincia o país de origen */
  origen: string;
  /** Cantidad de personas en este grupo específico */
  num_visitantes: number;
}

/**
 * Extensión de GrupoVisitante utilizada internamente en componentes de UI 
 * (como tablas dinámicas) para manejar keys únicas temporales.
 */
export interface GrupoExtendio extends GrupoVisitante {
  /** Clave temporal única para renderizado de listas en React */
  _key: number;
}

/**
 * Datos requeridos para crear o actualizar un Evento a través de un formulario.
 */
export interface EventoFormData {
  nombre_evento: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_tipo: number;
  id_usuario: UUID;
  finalizado?: boolean;
}

/**
 * Vista detallada de un registro de asistencia a evento,
 * incluyendo datos anidados del evento y el usuario que lo gestiona.
 */
export interface RegistroEvento {
  /** Identificador del grupo de visitantes */
  id_grupo: number;
  /** Provincia o país */
  origen: string;
  /** Clasificación del origen */
  tipo_origen: 'provincia' | 'pais';
  /** Total de personas */
  num_visitantes: number;
  /** Fecha exacta del registro */
  created_at: string;
  /** Datos del evento relacionado (Join de Supabase) */
  evento?: {
    nombre_evento: string;
    descripcion?: string;
    /** Datos del perfil del creador del evento */
    perfil?: { nombre_usuario?: string; nombre?: string; avatar_url?: string };
  };
  /** Permite campos adicionales dinámicos */
  [key: string]: unknown;
}
