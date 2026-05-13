/**
 * Representa una Nota o Tarea en el sistema colaborativo interno.
 * Las notas pueden ser públicas (generales) o asignadas a un trabajador específico.
 */
export interface Nota {
  /** Identificador único de la nota */
  id: string;
  /** Título descriptivo */
  titulo: string;
  /** Contenido completo de la nota */
  contenido: string;
  /** UUID del usuario que redactó la nota */
  creado_por: string;
  /** Fecha y hora de creación (formato ISO) */
  creado_en: string;
  /** Estado de progreso de la nota/tarea */
  estado: 'normal' | 'pendiente' | 'finalizada';
  /** Fecha de la última modificación */
  actualizado_en?: string;
  /** UUID del usuario al que va dirigida (si es null, es pública) */
  asignado_a?: string;
  /** Datos anexos del creador para mostrarlos en la UI (Join Supabase) */
  creador?: {
    nombre: string;
    primer_apellido: string;
    avatar_url?: string;
  };
  /** Datos anexos del receptor para mostrarlos en la UI (Join Supabase) */
  asignado?: {
    nombre: string;
    primer_apellido: string;
    avatar_url?: string;
  };
}
