export type UUID = string;

export interface Perfil {
  id: UUID; // ID de Auth (UUID)
  nombre_usuario: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  telefono?: string;
  role_id: number; // FK a roles (bigint/number)
  avatar_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
