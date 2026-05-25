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
 *
 * Estructura normalizada: la procedencia se modela con FKs a las tablas
 * `pais` y `provincia` en vez de cadenas de texto. Reglas:
 *  - `id_pais` es siempre obligatorio (todo grupo tiene un país de origen).
 *  - `id_provincia` solo se establece cuando el origen es una provincia española
 *    (en ese caso `id_pais` debe ser el de España; lo refuerza un trigger en BD).
 */
export interface GrupoVisitante {
  /** Identificador único del registro de grupo */
  id_grupo?: number;
  /** ID del evento al que asistieron */
  id_evento: number;
  /** ID del país de origen (obligatorio) */
  id_pais: number;
  /** ID de la provincia española de origen (opcional, solo si el país es España) */
  id_provincia?: number | null;
  /** Cantidad de personas en este grupo específico */
  num_visitantes: number;
  /** Join opcional con la tabla `pais` (cuando se hace SELECT con relación) */
  pais?: { nombre_pais: string } | null;
  /** Join opcional con la tabla `provincia` (cuando se hace SELECT con relación) */
  provincia?: { nombre_provincia: string } | null;
}

/**
 * Forma de un grupo en el FORMULARIO de creación/edición de eventos.
 *
 * Mantiene los campos en formato "amigable para UI" (nombre de provincia/país
 * como string y un toggle `modoOrigen`). En el momento de guardar se traduce
 * a `id_provincia` / `id_pais` para persistirlo según el modelo normalizado.
 */
export interface GrupoExtendio {
  /** Clave temporal única para renderizado de listas en React */
  _key: number;
  /** Id del registro persistido (si existe, modo edición) */
  id_grupo?: number;
  /** Id del evento al que pertenece (rellenado en el padre al crear el evento) */
  id_evento: number;
  /** Toggle de la UI: ¿procede de una provincia española o de un país? */
  modoOrigen: 'provincia' | 'pais';
  /** Nombre seleccionado en el desplegable (provincia o país según `modoOrigen`) */
  nombreOrigen: string;
  /** Número de personas en este subgrupo */
  num_visitantes: number;
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
 *
 * Tras la normalización de `grupo_visitante`, las columnas `tipo_origen`/`origen`
 * desaparecen. Se exponen helpers calculados (`origen` y `tipo_origen`) en el
 * mapeo de datos para mantener compatibilidad de UI sin tocar la BD.
 */
export interface RegistroEvento {
  /** Identificador del grupo de visitantes */
  id_grupo: number;
  /** ID del país de origen */
  id_pais: number;
  /** ID de la provincia (si aplica) */
  id_provincia?: number | null;
  /** Total de personas */
  num_visitantes: number;
  /** Fecha exacta del registro */
  created_at: string;
  /** Datos anidados del país (join Supabase) */
  pais?: { nombre_pais: string } | null;
  /** Datos anidados de la provincia (join Supabase) */
  provincia?: { nombre_provincia: string } | null;
  /** Texto derivado para mostrar (nombre de provincia o país) */
  origen?: string;
  /** Clasificación derivada (provincia si tiene id_provincia, si no pais) */
  tipo_origen?: 'provincia' | 'pais';
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
