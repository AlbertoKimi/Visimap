// ──────────────────────────────────────────────────────────────────────────────
// Interfaces del Chat IA con Gemini
// ──────────────────────────────────────────────────────────────────────────────

export type RolMensaje = 'user' | 'model';
export type TipoGrafico = 'bar' | 'area' | 'pie' | 'line' | 'composed';

// ── Archivo adjunto ────────────────────────────────────────────────────────────

export interface ArchivoAdjunto {
  nombre: string;
  tipo: string;       // MIME type (image/png, application/pdf, text/csv, ...)
  base64: string;     // contenido codificado en base64
  previewUrl: string; // Object URL para previsualización en el chat
  tamaño: number;     // bytes
}

// ── Gráfico generado dinámicamente ────────────────────────────────────────────

export interface GraficoGenerado {
  id: string;
  tipo: TipoGrafico;
  titulo: string;
  subtitulo?: string;
  datos: Record<string, unknown>[];
  /** Claves de datos que se deben graficar (eje Y en bar/line/area, dataKey en pie) */
  claves: string[];
  /** Clave que actúa de eje X o nameKey en pie */
  claveX: string;
  colores: string[];
}

// ── Consulta que Gemini solicita al frontend ───────────────────────────────────

export interface ConsultaDB {
  tabla: string;
  columnas: string;       // string de selección de Supabase (ej: "*, pais:id_pais(nombre_pais)")
  filtros?: Record<string, unknown>;
  rangoInicio?: string;   // ISO date para .gte
  rangoFin?: string;      // ISO date para .lte
  campoFecha?: string;    // columna sobre la que aplicar el rango
  limite?: number;
}

// ── Mensaje del chat ───────────────────────────────────────────────────────────

export interface MensajeChat {
  id: string;
  rol: RolMensaje;
  texto: string;
  timestamp: Date;
  archivos?: ArchivoAdjunto[];
  graficos?: GraficoGenerado[];
  /** true mientras Gemini está generando la respuesta */
  cargando?: boolean;
  /** true si hubo error al procesar */
  error?: boolean;
}

// ── Sugerencias rápidas ────────────────────────────────────────────────────────

export interface SugerenciaChat {
  etiqueta: string;
  prompt: string;
  icono: string;
}
