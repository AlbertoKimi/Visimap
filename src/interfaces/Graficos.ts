/**
 * Agrupa las estadísticas de actividad de un trabajador específico.
 * Utilizado para mostrar el rendimiento en el panel de control.
 */
export interface ActividadTrabajador {
  /** UUID del trabajador */
  id: string;
  /** Nombre completo o nombre de usuario */
  nombre: string;
  /** Cantidad de registros de visitas creados */
  registros: number;
  /** Cantidad de eventos creados o gestionados */
  eventos: number;
  /** Cantidad de notas o tareas creadas */
  notas: number;
  /** Suma total de todas las interacciones */
  total: number;
}

/**
 * Representa los datos agregados de visitas por día.
 * Utilizado en los gráficos de líneas o áreas (Recharts).
 */
export interface EvolucionDiaria {
  /** Fecha en formato string (ej: 'DD/MM') */
  dia: string;
  /** Número de visitantes registrados individualmente ese día */
  visitantesIndividuales: number;
  /** Número total de personas registradas como grupo o evento ese día */
  visitantesGrupo: number;
  /** Total combinado de visitantes en el día */
  total: number;
}

/**
 * Representa las estadísticas geográficas por provincia.
 * Utilizado en gráficos de barras o mapas de calor.
 */
export interface VisitaProvincia {
  /** Nombre de la provincia */
  provincia: string;
  /** Visitantes ordinarios procedentes de esta provincia */
  visitantesNormales: number;
  /** Visitantes de eventos procedentes de esta provincia */
  visitantesEventos: number;
  /** Total de visitantes de esta provincia */
  total: number;
}

/**
 * Interfaz ligera para mapear el estado de finalización de un evento
 * al calcular estadísticas en bloque.
 */
export interface EventoRaw {
  id_evento: number;
  finalizado: boolean;
}

/**
 * Datos básicos de un perfil requeridos para asociarlos a una actividad
 * en el Dashboard sin necesidad de cargar todo el objeto Perfil.
 */
export interface PerfilRaw {
  id: string;
  nombre: string;
  nombre_usuario: string;
}

/**
 * Props del componente personalizado que renderiza las etiquetas numéricas
 * sobre cada segmento de barra en los gráficos de Recharts.
 * Recibe automáticamente las coordenadas y dimensiones que inyecta Recharts,
 * además de los flags de personalización del tema y comportamiento.
 */
export interface CustomBarLabelProps {
  /** Coordenada X de la barra (inyectada por Recharts) */
  x?: string | number;
  /** Coordenada Y de la barra (inyectada por Recharts) */
  y?: string | number;
  /** Anchura de la barra en píxeles */
  width?: string | number;
  /** Altura de la barra en píxeles */
  height?: string | number;
  /** Valor numérico bruto del dato a renderizar */
  value?: any;
  /** Objeto payload completo con todos los campos de la fila */
  payload?: any;
  /** Índice de la fila dentro del dataset */
  index?: number;
  /** Dataset completo (algunos hooks de Recharts lo inyectan en lugar de payload) */
  data?: any[];
  /** Indica si el tema actual es oscuro, para ajustar el color del texto */
  isDark?: boolean;
  /** Tamaño base de la fuente (se reduce automáticamente si no cabe) */
  fontSize?: string | number;
  /** Si true, muestra un 0 cuando el total de la fila es 0 (útil para el ranking de personal) */
  showZeroIfTotalZero?: boolean;
  /** Nombre del campo del payload del que extraer el valor real */
  targetKey?: string;
}
