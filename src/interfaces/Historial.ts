export interface VisitaHistorial {
  anio: number;
  mes: number;
  total: number;
}

export interface DesgloseItem {
  nombre: string;
  total: number;
}

export interface RawProvResult {
  cantidad: number;
  provincia: { nombre_provincia: string } | null;
}

export interface RawPaisResult {
  cantidad: number;
  pais: { nombre_pais: string } | null;
}
