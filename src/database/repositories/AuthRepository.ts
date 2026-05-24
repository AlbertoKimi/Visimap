/**
 * Contrato (Interface) para el repositorio de autenticación.
 * Define las operaciones abstractas que cualquier proveedor de identidad (ej: Supabase, Firebase)
 * debe implementar para funcionar con la aplicación.
 */
export interface AuthRepository {
  /** Obtiene la sesión activa actual del proveedor de Auth */
  getSession(): Promise<any>;
  /** Inicia sesión con correo electrónico y contraseña. Devuelve la información del usuario/sesión recién creada. */
  signIn(email: string, password: string): Promise<{ user: any; session: any } | void>;
  /** Cierra la sesión activa y limpia los tokens */
  signOut(): Promise<void>;
  /** Actualiza la contraseña del usuario actualmente autenticado */
  updatePassword(password: string): Promise<void>;
  /** 
   * Se suscribe a los cambios de estado de autenticación (login, logout, token refresh) 
   * @param callback Función que se ejecutará cuando ocurra un evento de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void): void;
  /**
   * Envía un correo de invitación a un nuevo empleado para que establezca su contraseña.
   * @param email Correo electrónico corporativo del empleado
   * @param metadata Metadatos opcionales (ej: rol asignado, nombre)
   */
  inviteUser(email: string, metadata: any): Promise<void>;
}
