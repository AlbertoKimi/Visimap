/**
 * Representa un Identificador Único Universal.
 */
export type UUID = string;

/**
 * Interfaz principal que define la estructura de datos de un usuario en el sistema.
 * Contiene tanto información personal como datos de control de acceso.
 */
export interface Perfil {
  /** Identificador único del usuario (UUID de Supabase) */
  id: UUID;
  /** Nombre de usuario para login o visualización rápida */
  nombre_usuario: string;
  /** Nombre de pila del usuario */
  nombre: string;
  /** Primer apellido del usuario */
  primer_apellido: string;
  /** Segundo apellido del usuario (opcional) */
  segundo_apellido?: string;
  /** Correo electrónico único del usuario */
  email: string;
  /** Número de teléfono de contacto (opcional) */
  telefono?: string;
  /** ID del rol asignado al usuario (ej: 1 para Admin, 2 para Trabajador) */
  role_id: number;
  /** URL a la imagen de perfil del usuario (opcional) */
  avatar_url?: string;
  /** Indica si la cuenta del usuario está activa o ha sido desactivada */
  active: boolean;
  /** Fecha de creación del registro en la base de datos (generado automáticamente) */
  created_at?: string;
  /** Fecha de la última modificación del registro (generado automáticamente) */
  updated_at?: string;
}
