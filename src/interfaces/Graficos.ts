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
