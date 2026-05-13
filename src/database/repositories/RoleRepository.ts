import { Rol } from "@/interfaces/Rol";

/**
 * Contrato (Interface) para el repositorio de Roles de seguridad.
 */
export interface RoleRepository {
  /** Obtiene la lista completa de roles disponibles en el sistema (ej: Admin, Trabajador) */
  getAll(): Promise<Rol[]>;
}
