/**
 * Representa un Rol de acceso dentro de la aplicación.
 * Gestiona los niveles de permiso (ej: Administrador, Trabajador).
 */
export interface Rol {
  /** Identificador numérico único del rol (ej: 1 = Admin, 2 = Trabajador) */
  id: number;
  /** Nombre representativo del rol */
  nombre: string;
  /** Descripción opcional detallando los permisos de este rol */
  descripcion?: string;
  /** Fecha de creación en la base de datos */
  created_at?: string;
}
