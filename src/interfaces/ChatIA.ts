export type RolMensaje = 'user' | 'model';
export type TipoGrafico = 'bar' | 'area' | 'pie' | 'line' | 'composed';


export interface ArchivoAdjunto {
  nombre: string;
  tipo: string;
  base64: string;
  previewUrl: string;
  tamaño: number;
}

export interface GraficoGenerado {
  id: string;
  tipo: TipoGrafico;
  titulo: string;
  subtitulo?: string;
  datos: Record<string, unknown>[];
  claves: string[];
  claveX: string;
  colores: string[];
}


export interface ConsultaDB {
  tabla: string;
  columnas: string;
  filtros?: Record<string, unknown>;
  rangoInicio?: string;
  rangoFin?: string;
  campoFecha?: string;
  limite?: number;
}


export interface MensajeChat {
  id: string;
  rol: RolMensaje;
  texto: string;
  timestamp: Date;
  archivos?: ArchivoAdjunto[];
  graficos?: GraficoGenerado[];
  cargando?: boolean;
  error?: boolean;
}

export interface SugerenciaChat {
  etiqueta: string;
  prompt: string;
  icono: string;
}
