export interface Pais {
  id_pais: number;
  nombre_pais: string;
}

export interface Provincia {
  id_provincia: number;
  nombre_provincia: string;
}

export interface RegistroVisitante {
  id_registro?: number;
  id_pais: number;
  id_provincia: number | null;
  id_usuario: string;
  cantidad: number;
  tipo_visita: 'individual' | 'grupo';
  observaciones: string | null;
  created_at?: string;
}
