export const PROVINCIAS = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba',
  'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Illes Balears', 'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lleida',
  'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
  'Ceuta',
];

export const COLORES_TIPO: { [key: string]: string } = {
  visita: '#b3d4f5', 
  exposicion: '#d4b8f0', 
  taller: '#b2e8c8', 
  conferencia: '#fde6a0', 
  mantenimiento: '#d4dce8', 
  boda: '#f9c1d9', 
  otro: '#c5c8f5', 
};

export const COLOR_TEXTO = '#4a4a6a';
export const FONDO_DEFECTO = '#d4dce8';

export const obtenerColor = (tipo?: string) => {
  const bg = COLORES_TIPO[tipo?.toLowerCase() || ''] || FONDO_DEFECTO;
  return { bg, text: COLOR_TEXTO, border: bg };
};
