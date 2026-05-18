import { TipoEvento } from "@/interfaces/Evento";

/**
 * Contrato (Interface) para el repositorio de Tipos de Eventos (Categorías).
 */
export interface EventTypeRepository {
  /** Obtiene la lista estática de categorías de eventos (Ej: Exposición, Charla, etc.) */
  getAll(): Promise<TipoEvento[]>;
}
