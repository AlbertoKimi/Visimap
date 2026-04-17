export type UUID = string;

export interface Evento {
  id_evento: number;
  nombre_evento: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_tipo: number;
  id_usuario: UUID;
  finalizado: boolean;
  created_at?: string;
  tipo_evento?: {
    nombre: string;
  };
}

export interface TipoEvento {
  id_tipo: number;
  nombre: string;
}

export interface GrupoVisitante {
  id_grupo?: number;
  id_evento: number;
  tipo_origen: 'provincia' | 'pais';
  origen: string;
  num_visitantes: number;
}

export interface EventoFormData {
  nombre_evento: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_tipo: number;
  id_usuario: UUID;
  finalizado?: boolean;
}
