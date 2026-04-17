export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  creado_por: string;
  creado_en: string;
  estado: 'normal' | 'pendiente' | 'finalizada';
  actualizado_en?: string;
  asignado_a?: string;
  creador?: {
    nombre: string;
    primer_apellido: string;
    avatar_url?: string;
  };
  asignado?: {
    nombre: string;
    primer_apellido: string;
    avatar_url?: string;
  };
}
