import { Evento, EventoFormData, GrupoVisitante } from "@/interfaces/Evento";

/**
 * Contrato (Interface) para el repositorio de Eventos.
 * Maneja todas las operaciones CRUD y lógicas relacionadas con exposiciones,
 * actividades del museo y los registros de asistencia asociados a ellos.
 */
export interface EventRepository {
  /** Obtiene todos los eventos programados o finalizados */
  getAll(): Promise<Evento[]>;
  /** Crea un nuevo evento y, opcionalmente, inserta registros de asistencia (grupos) a ese evento */
  create(event: EventoFormData, groups?: GrupoVisitante[]): Promise<Evento>;
  /** Actualiza los datos de un evento existente y reemplaza/actualiza sus grupos de asistencia */
  update(id: number, event: Partial<EventoFormData>, groups?: GrupoVisitante[]): Promise<void>;
  /** Elimina un evento y todos los registros de asistencia que estén en cascada */
  delete(id: number): Promise<void>;
  /** Marca un evento como finalizado o vuelve a reactivarlo */
  toggleFinalizado(id: number, finalizado: boolean): Promise<void>;
  
  /** Obtiene todos los registros de asistencia asociados a eventos (para el dashboard o tablas completas) */
  getAllGrupoVisitantes(): Promise<any[]>;
  /** Elimina un registro de asistencia específico de un evento */
  deleteGrupoVisitante(id: number): Promise<void>;
  /** Actualiza la cantidad o descripción de un registro de asistencia */
  updateGrupoVisitante(id: number, num_visitantes: number, descripcion?: string, id_evento?: number): Promise<void>;
  /** Obtiene exclusivamente los registros de asistencia asociados a un ID de evento concreto */
  getGruposByEvento(id_evento: number): Promise<GrupoVisitante[]>;
}
