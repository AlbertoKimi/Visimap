import { Perfil, UUID } from "@/interfaces/Perfil";

/**
 * Resumen estadístico de la actividad de un usuario.
 */
export interface UserStats {
  /** Número de eventos creados */
  eventos: number;
  /** Número de registros de visitantes creados */
  registros: number;
  /** Fecha en formato ISO de la última acción registrada */
  ultimaActividad: string;
}

/**
 * Contrato (Interface) para el repositorio de Perfiles de Usuario.
 * Gestiona la información extendida de los trabajadores (tabla perfiles).
 */
export interface UserRepository {
  /** Obtiene todos los perfiles registrados en el sistema */
  getAll(): Promise<Perfil[]>;
  /** Obtiene un perfil específico mediante su UUID */
  getById(id: UUID): Promise<Perfil | null>;
  /** Actualiza la información personal de un perfil */
  update(id: UUID, profile: Partial<Perfil>): Promise<void>;
  /** Activa o desactiva la cuenta de un trabajador (Soft Delete) */
  toggleStatus(id: UUID, status: boolean): Promise<void>;
  /** Elimina físicamente a un usuario de la base de datos (Hard Delete) */
  delete(id: UUID): Promise<void>;
  /** Calcula las estadísticas de uso de un trabajador en base a sus interacciones */
  getStats(id: UUID): Promise<UserStats>;
  /** Sube un nuevo avatar al Storage y devuelve la URL pública generada */
  uploadAvatar(id: UUID, file: File): Promise<string>;
}
