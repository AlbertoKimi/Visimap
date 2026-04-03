interface ComunidadColor {
  [key: string]: string;
}

const comunidadColores: ComunidadColor = {
  extremadura: 'fill-green-300',
  andalucia: 'fill-sky-200',
  castillaLeon: 'fill-orange-100',
  castillaLaMancha: 'fill-violet-200',
  galicia: 'fill-teal-200',
  asturias: 'fill-indigo-300',
  cantabria: 'fill-pink-200',
  paisVasco: 'fill-emerald-300',
  navarra: 'fill-amber-200',
  rioja: 'fill-red-300',
  aragon: 'fill-lime-200',
  cataluna: 'fill-cyan-200',
  valencia: 'fill-orange-300',
  murcia: 'fill-fuchsia-300',
  madrid: 'fill-rose-400',
  baleares: 'fill-blue-300',
  canarias: 'fill-yellow-200',
  ciudades: 'fill-gray-300'
};

const coloresProvincia: { [key: string]: string } = {
  // Extremadura
  badajoz: comunidadColores.extremadura,
  caceres: comunidadColores.extremadura,

  // Andalucía
  almeria: comunidadColores.andalucia,
  cadiz: comunidadColores.andalucia,
  cordoba: comunidadColores.andalucia,
  granada: comunidadColores.andalucia,
  huelva: comunidadColores.andalucia,
  jaen: comunidadColores.andalucia,
  malaga: comunidadColores.andalucia,
  sevilla: comunidadColores.andalucia,

  // Castilla y León
  avila: comunidadColores.castillaLeon,
  burgos: comunidadColores.castillaLeon,
  leon: comunidadColores.castillaLeon,
  palencia: comunidadColores.castillaLeon,
  salamanca: comunidadColores.castillaLeon,
  segovia: comunidadColores.castillaLeon,
  soria: comunidadColores.castillaLeon,
  valladolid: comunidadColores.castillaLeon,
  zamora: comunidadColores.castillaLeon,

  // Castilla-La Mancha
  albacete: comunidadColores.castillaLaMancha,
  ciudadreal: comunidadColores.castillaLaMancha,
  cuenca: comunidadColores.castillaLaMancha,
  guadalajara: comunidadColores.castillaLaMancha,
  toledo: comunidadColores.castillaLaMancha,

  // Galicia
  la_coruna: comunidadColores.galicia,
  lugo: comunidadColores.galicia,
  ourense: comunidadColores.galicia,
  pontevedra: comunidadColores.galicia,

  // Cataluña
  barcelona: comunidadColores.cataluna,
  gerona: comunidadColores.cataluna,
  lleida: comunidadColores.cataluna,
  tarragona: comunidadColores.cataluna,

  // Comunidad Valenciana
  alicante: comunidadColores.valencia,
  castellon: comunidadColores.valencia,
  valencia: comunidadColores.valencia,

  // Aragón
  huesca: comunidadColores.aragon,
  teruel: comunidadColores.aragon,
  zaragoza: comunidadColores.aragon,

  // País Vasco
  alava: comunidadColores.paisVasco,
  guipuzcoa: comunidadColores.paisVasco,
  vizcaya: comunidadColores.paisVasco,

  // Uniprovinciales
  asturias: comunidadColores.asturias,
  cantabria: comunidadColores.cantabria,
  la_rioja: comunidadColores.rioja,
  murcia: comunidadColores.murcia,
  navarra: comunidadColores.navarra,
  madrid: comunidadColores.madrid,
  islasbaleares: comunidadColores.baleares,

  // Canarias
  las_palmas: comunidadColores.canarias,
  tenerife: comunidadColores.canarias, 

  // Ceuta y Melilla
  ceuta: comunidadColores.ciudades,
  melilla: comunidadColores.ciudades
};

export const getColoresProvincia = (id: string): string => {
  return coloresProvincia[id] || 'fill-gray-100'; 
};

export const datosLeyenda = [
  { nombre: 'Andalucía', color: comunidadColores.andalucia },
  { nombre: 'Aragón', color: comunidadColores.aragon },
  { nombre: 'Asturias', color: comunidadColores.asturias },
  { nombre: 'Baleares', color: comunidadColores.baleares },
  { nombre: 'Canarias', color: comunidadColores.canarias },
  { nombre: 'Cantabria', color: comunidadColores.cantabria },
  { nombre: 'Castilla-La Mancha', color: comunidadColores.castillaLaMancha },
  { nombre: 'Castilla y León', color: comunidadColores.castillaLeon },
  { nombre: 'Cataluña', color: comunidadColores.cataluna },
  { nombre: 'C. Valenciana', color: comunidadColores.valencia },
  { nombre: 'Ceuta y Melilla', color: comunidadColores.ciudades },
  { nombre: 'Extremadura', color: comunidadColores.extremadura },
  { nombre: 'Galicia', color: comunidadColores.galicia },
  { nombre: 'La Rioja', color: comunidadColores.rioja },
  { nombre: 'Madrid', color: comunidadColores.madrid },
  { nombre: 'Murcia', color: comunidadColores.murcia },
  { nombre: 'Navarra', color: comunidadColores.navarra },
  { nombre: 'País Vasco', color: comunidadColores.paisVasco },
].sort((a, b) => a.nombre.localeCompare(b.nombre));
