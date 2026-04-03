import { Perfil, UUID } from '../../interfaces/Perfil';

export interface UserRepository {
  getAll(): Promise<Perfil[]>;
  getById(id: UUID): Promise<Perfil | null>;
  update(id: UUID, profile: Partial<Perfil>): Promise<void>;
  toggleStatus(id: UUID, status: boolean): Promise<void>;
  delete(id: UUID): Promise<void>;
}
