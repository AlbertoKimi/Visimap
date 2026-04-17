import { Perfil, UUID } from "@/interfaces/Perfil";

export interface UserStats {
  eventos: number;
  registros: number;
  ultimaActividad: string;
}

export interface UserRepository {
  getAll(): Promise<Perfil[]>;
  getById(id: UUID): Promise<Perfil | null>;
  update(id: UUID, profile: Partial<Perfil>): Promise<void>;
  toggleStatus(id: UUID, status: boolean): Promise<void>;
  delete(id: UUID): Promise<void>;
  getStats(id: UUID): Promise<UserStats>;
  uploadAvatar(id: UUID, file: File): Promise<string>;
}
