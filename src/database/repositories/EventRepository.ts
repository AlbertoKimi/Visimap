import { Evento, GrupoVisitante } from '../../interfaces/Evento';

export interface EventRepository {
  getAll(): Promise<Evento[]>;
  create(event: any, groups?: GrupoVisitante[]): Promise<Evento>;
  update(id: number, event: any, groups?: GrupoVisitante[]): Promise<void>;
  delete(id: number): Promise<void>;
  toggleFinalizado(id: number, finalizado: boolean): Promise<void>;
  getAllGrupoVisitantes(): Promise<any[]>;
  deleteGrupoVisitante(id: number): Promise<void>;
  updateGrupoVisitante(id: number, num_visitantes: number): Promise<void>;
}
