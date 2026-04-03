import { TipoEvento } from '../../interfaces/Evento';

export interface EventTypeRepository {
  getAll(): Promise<TipoEvento[]>;
}
