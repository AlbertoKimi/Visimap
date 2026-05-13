import { Nota } from "@/interfaces/Nota";

/**
 * Contrato (Interface) para el repositorio de Notas y Tareas.
 * Define cómo se interactúa con el sistema de mensajería asíncrona entre trabajadores.
 */
export interface NotaRepository {
  /** Obtiene las notas ordenadas por fecha (las más recientes primero) */
  getNotasRecientes(): Promise<Nota[]>;
  /** 
   * Crea una nueva nota en el sistema.
   * Excluye los campos autogenerados por la base de datos o que dependen de Joins.
   */
  createNota(nota: Omit<Nota, 'id' | 'creado_en' | 'estado' | 'actualizado_en' | 'creador' | 'asignado' | 'profiles'>): Promise<Nota>;
  /** Actualiza parcialmente el contenido o estado de una nota existente */
  updateNota(id: string, updates: Partial<Nota>): Promise<Nota>;
  /** Elimina permanentemente una nota de la base de datos */
  deleteNota(id: string): Promise<void>;
}
