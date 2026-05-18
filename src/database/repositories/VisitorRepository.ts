import { Pais, Provincia, RegistroVisitante } from "@/interfaces/Visitor";

/**
 * Contrato (Interface) para el repositorio de Visitantes individuales y grupos.
 */
export interface VisitorRepository {
  /** Busca un país en la base de datos por su nombre exacto */
  getPaisByName(name: string): Promise<Pais | null>;
  /** Busca una provincia española en la base de datos por su nombre exacto */
  getProvinciaByName(name: string): Promise<Provincia | null>;
  /** Crea un nuevo registro de visita ordinaria en el sistema */
  createRegistro(registro: RegistroVisitante): Promise<void>;
  /** Obtiene todos los registros de visitas (útil para listados y mapas) */
  getAllRegistros(): Promise<any[]>;
  /** Elimina un registro de visita específico */
  deleteRegistro(id: number): Promise<void>;
  /** Modifica la cantidad de personas o las anotaciones de un registro existente */
  updateRegistro(id: number, cantidad: number, observaciones?: string): Promise<void>;
  /** Obtiene el catálogo completo de países disponibles */
  getAllPaises(): Promise<Pais[]>;
}
