/** Roles permitidos en la conversación del chat */
export type RolMensaje = 'user' | 'model';

/** Tipos de gráficos soportados por el generador visual del asistente */
export type TipoGrafico = 'bar' | 'area' | 'pie' | 'line' | 'composed';

/**
 * Representa un archivo adjunto enviado por el usuario al asistente.
 */
export interface ArchivoAdjunto {
  /** Nombre original del archivo */
  nombre: string;
  /** Tipo MIME del archivo (ej: 'image/png') */
  tipo: string;
  /** Contenido del archivo codificado en Base64 para el envío a la API */
  base64: string;
  /** URL temporal para previsualizar el archivo en el frontend */
  previewUrl: string;
  /** Tamaño del archivo en bytes */
  tamaño: number;
}

/**
 * Define la estructura de configuración y datos para renderizar un gráfico
 * generado por la Inteligencia Artificial.
 */
export interface GraficoGenerado {
  /** Identificador único del gráfico */
  id: string;
  /** Tipo visual del gráfico */
  tipo: TipoGrafico;
  /** Título principal a mostrar sobre el gráfico */
  titulo: string;
  /** Subtítulo descriptivo opcional */
  subtitulo?: string;
  /** Array de datos en formato JSON procesable por Recharts */
  datos: Record<string, unknown>[];
  /** Propiedades (keys) de los datos que se representarán en el eje Y o como series */
  claves: string[];
  /** Propiedad de los datos que se usará como etiqueta en el eje X */
  claveX: string;
  /** Paleta de colores asignada a las series del gráfico */
  colores: string[];
}

/**
 * Parámetros estructurados generados por la IA para realizar una consulta
 * directa a la base de datos de Supabase.
 */
export interface ConsultaDB {
  /** Nombre de la tabla o vista a consultar (ej: 'vista_visitas_unificadas') */
  tabla: string;
  /** Columnas a seleccionar, separadas por coma */
  columnas: string;
  /** Objeto clave-valor para aplicar filtros WHERE */
  filtros?: Record<string, unknown>;
  /** Fecha inicial para filtrar (formato ISO) */
  rangoInicio?: string;
  /** Fecha final para filtrar (formato ISO) */
  rangoFin?: string;
  /** Nombre de la columna que contiene la fecha a filtrar */
  campoFecha?: string;
  /** Número máximo de resultados a devolver */
  limite?: number;
}

/**
 * Estructura principal de un mensaje dentro de la interfaz del Asistente IA.
 */
export interface MensajeChat {
  /** Identificador único del mensaje */
  id: string;
  /** Autor del mensaje ('user' o 'model') */
  rol: RolMensaje;
  /** Contenido de texto del mensaje (soporta Markdown) */
  texto: string;
  /** Marca de tiempo de cuando se envió/recibió */
  timestamp: Date;
  /** Archivos adjuntos si los hubiera */
  archivos?: ArchivoAdjunto[];
  /** Gráficos generados como respuesta, si los hubiera */
  graficos?: GraficoGenerado[];
  /** Indica si el mensaje está en proceso de generación (typing) */
  cargando?: boolean;
  /** Indica si ocurrió un error al generar este mensaje */
  error?: boolean;
}

/**
 * Define un botón de sugerencia rápida (Píldora) que aparece en el input del chat.
 */
export interface SugerenciaChat {
  /** Texto corto que se muestra en el botón */
  etiqueta: string;
  /** Prompt completo que se enviará al asistente al hacer clic */
  prompt: string;
  /** Emoji o icono para acompañar la etiqueta */
  icono: string;
}
