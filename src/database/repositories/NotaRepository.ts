import { Nota } from '../../interfaces/Nota';

export interface NotaRepository {
  getNotasRecientes(): Promise<Nota[]>;
  createNota(nota: Omit<Nota, 'id' | 'creado_en' | 'estado' | 'actualizado_en' | 'creador' | 'asignado' | 'profiles'>): Promise<Nota>;
  updateNota(id: string, updates: Partial<Nota>): Promise<Nota>;
  deleteNota(id: string): Promise<void>;
}
