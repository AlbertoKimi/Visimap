export interface ActividadTrabajador {
  id: string;
  nombre: string;
  registros: number;
  eventos: number;
  notas: number;
  total: number;
}

export interface EvolucionDiaria {
  dia: string;
  visitantesIndividuales: number;
  visitantesGrupo: number;
  total: number;
}

export interface VisitaProvincia {
  provincia: string;
  visitantesNormales: number;
  visitantesEventos: number;
  total: number;
}

export interface EventoRaw {
  id_evento: number;
  finalizado: boolean;
}

export interface PerfilRaw {
  id: string;
  nombre: string;
  nombre_usuario: string;
}
