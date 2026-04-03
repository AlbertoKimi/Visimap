import { Pais, Provincia, RegistroVisitante } from '../../interfaces/Visitor';

export interface VisitorRepository {
  getPaisByName(name: string): Promise<Pais | null>;
  getProvinciaByName(name: string): Promise<Provincia | null>;
  createRegistro(registro: RegistroVisitante): Promise<void>;
}
