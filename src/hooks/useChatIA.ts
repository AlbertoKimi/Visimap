/**
 * Custom Hook que orquesta toda la lógica del Asistente Virtual (Chat IA).
 * Maneja el estado de los mensajes, carga de adjuntos y la doble llamada (Query -> Analizar)
 * requerida para procesar solicitudes de datos.
 * @module
 */
import { useState, useCallback, useRef } from 'react';
import { openaiService } from '@/database/openai/openaiService';
import { supabase } from '@/database/supabase/client';
import { RepositoryFactory } from '@/database/RepositoryFactory';
import { ICONOS } from '@/constantes/iconos';
import type {
  MensajeChat,
  ArchivoAdjunto,
  GraficoGenerado,
  ConsultaDB,
  SugerenciaChat,
} from '@/interfaces/ChatIA';
import type { EventoRow } from '@/database/repositories/StatsRepository';

const statsRepo = RepositoryFactory.getStatsRepository();

/** Normaliza una cadena para comparación robusta (case-insensitive y sin tildes). */
const stripAccents = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ──────────────────────────────────────────────────────────────────────────────
// Sugerencias rápidas
// ──────────────────────────────────────────────────────────────────────────────

/** Batería de sugerencias iniciales para guiar al usuario */
export const SUGERENCIAS: SugerenciaChat[] = [
  {
    etiqueta: 'Visitantes del mes',
    prompt: '¿Cuántos visitantes totales ha habido este mes? Dame un resumen por semana.',
    icono: ICONOS.grafica,
  },
  {
    etiqueta: 'Gráfico por provincias',
    prompt: 'Genera un gráfico de barras con los visitantes por provincia del mes actual.',
    icono: ICONOS.provincia,
  },
  {
    etiqueta: 'Rendimiento del personal',
    prompt: 'Muéstrame el rendimiento del personal: ¿quién ha registrado más visitantes este mes?',
    icono: ICONOS.rendimiento,
  },
  {
    etiqueta: 'Resumen anual',
    prompt: 'Crea un resumen anual completo del año actual: total de visitantes, visitantes por mes, top provincias, top países y eventos celebrados.',
    icono: ICONOS.resumen,
  },
  {
    etiqueta: 'Eventos activos',
    prompt: '¿Qué eventos hay activos o próximos? Dame un listado con sus fechas.',
    icono: ICONOS.mascaras,
  },
  {
    etiqueta: 'España vs Mundo',
    prompt: 'Compara los visitantes nacionales (España) vs internacionales del año actual.',
    icono: ICONOS.mundo,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Ejecutor de consultas DB generadas por Groq (IA)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Función middleware que traduce el objeto ConsultaDB generado por la IA
 * en una petición real de Supabase JS al backend.
 */
async function ejecutarConsultaDB(consulta: ConsultaDB): Promise<{ datos: unknown[]; errorMsg?: string }> {
  // Sanitizar columnas: si viene con joins mal formateados, usar '*'
  let columnas = consulta.columnas || '*';

  let query = supabase
    .from(consulta.tabla)
    .select(columnas);

  if (consulta.campoFecha && consulta.rangoInicio) {
    let inicio = consulta.rangoInicio;
    if (/^\d{4}-\d{2}-\d{2}$/.test(inicio)) {
      inicio = `${inicio}T00:00:00`;
    }
    query = query.gte(consulta.campoFecha, inicio);
  }
  if (consulta.campoFecha && consulta.rangoFin) {
    let fin = consulta.rangoFin;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fin)) {
      fin = `${fin}T23:59:59.999`;
    }
    query = query.lte(consulta.campoFecha, fin);
  }
  if (consulta.filtros) {
    for (const [clave, valor] of Object.entries(consulta.filtros)) {
      query = query.eq(clave, valor);
    }
  }
  if (consulta.limite) {
    query = query.limit(consulta.limite);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[useChatIA] Error en consulta DB:', error);
    // Si falla con columnas complejas, reintentamos con '*'
    if (columnas !== '*') {
      const { data: dataSimple, error: errorSimple } = await supabase
        .from(consulta.tabla)
        .select('*')
        .gte(consulta.campoFecha || 'created_at', consulta.rangoInicio || '2026-01-01')
        .lte(consulta.campoFecha || 'created_at', consulta.rangoFin || new Date().toISOString().split('T')[0])
        .limit(consulta.limite || 500);
      if (!errorSimple && dataSimple) {
        return { datos: dataSimple };
      }
    }
    return { datos: [], errorMsg: error.message };
  }
  return { datos: data || [] };
}

// ──────────────────────────────────────────────────────────────────────────────
// Generador de IDs únicos
// ──────────────────────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ──────────────────────────────────────────────────────────────────────────────
// Hook principal
// ──────────────────────────────────────────────────────────────────────────────

export function useChatIA() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [adjuntos, setAdjuntos] = useState<ArchivoAdjunto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ref al último mensaje para hacer scroll automático
  const ultimoMensajeRef = useRef<HTMLDivElement | null>(null);

  const scrollAlFinal = useCallback(() => {
    setTimeout(() => {
      ultimoMensajeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }, []);

  // ── Añadir archivo adjunto ─────────────────────────────────────────────────

  /** Procesa y convierte un archivo subido a base64 para enviarlo a la API */
  const agregarArchivo = useCallback(async (file: File) => {
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`El archivo "${file.name}" supera el límite de ${MAX_MB} MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // FileReader devuelve "data:mime;base64,XXXX" — extraemos solo XXXX
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setAdjuntos(prev => [
      ...prev,
      {
        nombre: file.name,
        tipo: file.type,
        base64,
        previewUrl,
        tamaño: file.size,
      },
    ]);
  }, []);

  const eliminarArchivo = useCallback((nombre: string) => {
    setAdjuntos(prev => {
      const archivo = prev.find(a => a.nombre === nombre);
      if (archivo) URL.revokeObjectURL(archivo.previewUrl);
      return prev.filter(a => a.nombre !== nombre);
    });
  }, []);

  // ── Enviar mensaje ─────────────────────────────────────────────────────────

  /**
   * Ciclo de vida completo del envío de un mensaje:
   * 1. Muestra el mensaje del usuario.
   * 2. Consulta al LLM.
   * 3. Si el LLM pide datos, se ejecutan contra Supabase (ejecutarConsultaDB).
   * 4. Se inyectan los datos de vuelta al LLM para que analice y/o grafique.
   */
  const enviarMensaje = useCallback(async (texto: string) => {
    if (!texto.trim() && adjuntos.length === 0) return;
    if (isLoading) return;

    const archivosActuales = [...adjuntos];
    setAdjuntos([]);

    // Mensaje del usuario
    const mensajeUsuario: MensajeChat = {
      id: uid(),
      rol: 'user',
      texto: texto.trim(),
      timestamp: new Date(),
      archivos: archivosActuales.length > 0 ? archivosActuales : undefined,
    };

    // Placeholder del modelo (cargando)
    const idPlaceholder = uid();
    const mensajePlaceholder: MensajeChat = {
      id: idPlaceholder,
      rol: 'model',
      texto: '',
      timestamp: new Date(),
      cargando: true,
    };

    setMensajes(prev => [...prev, mensajeUsuario, mensajePlaceholder]);
    setIsLoading(true);
    scrollAlFinal();


    // CONSULTAS DE VISITANTES Y ESTADÍSTICAS EN TIEMPO REAL

    const lowerText = texto.toLowerCase().trim();
    const ahora = new Date();
    const currentYear = ahora.getFullYear();
    const currentMonthIndex = ahora.getMonth();
    const mesesNombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const pad = (n: number) => String(n).padStart(2, '0');

    const matchAnio = lowerText.match(/\b(20\d{2})\b/);
    // targetYear: se recalculará tras detectar matchFechaCompleta, por ahora tomamos del año suelto
    const targetYearBase = matchAnio ? parseInt(matchAnio[1], 10) : currentYear;

    const tieneVisitantes = lowerText.includes('visitante') || lowerText.includes('visita') || lowerText.includes('persona') || lowerText.includes('gente');
    const tieneAnio = (matchAnio !== null) || lowerText.includes('este año') || lowerText.includes('de este año') || lowerText.includes('del año') || lowerText.includes('en lo que va de año') || lowerText.includes('este 2026') || lowerText.includes('en 2026') || (lowerText.includes('año') && (lowerText.includes('actual') || lowerText.includes('este') || lowerText.includes('el') || lowerText.includes('en')));
    const tieneTotalHistorico = lowerText.includes('total') || lowerText.includes('histórico') || lowerText.includes('historico') || lowerText.includes('acumulado') || lowerText.includes('todos los tiempos');
    // Detecta tanto la palabra "mes"/"mensual" como nombres de mes (enero, febrero, ..., diciembre).
    // Sin esto, consultas como "visitantes en mayo de este año" caerían en el interceptor anual.
    const tieneMes = lowerText.includes('mes') || lowerText.includes('mensual') || mesesNombres.some(m => lowerText.includes(m));
    const tienePersonal = lowerText.includes('personal') || lowerText.includes('rendimiento') || lowerText.includes('trabajador') || lowerText.includes('empleado');
    const tieneProvincias = lowerText.includes('provincia') || lowerText.includes('provincias');
    const tieneMundo = lowerText.includes('españa') || lowerText.includes('mundo') || lowerText.includes('extranjero') || lowerText.includes('nacional') || lowerText.includes('internacional');
    // Distinción precisa: "nacional" es substring de "internacional", hay que limpiar antes de comparar.
    const lowerTextSinInter = lowerText.replace(/internacional(es)?/g, ' ');
    const mencionaNacionalLimpio = /\bnacional(es)?\b/.test(lowerTextSinInter) || lowerText.includes('españa');
    const mencionaInternacionalLimpio = /internacional(es)?/.test(lowerText) || /\bextranjer/.test(lowerText) || lowerText.includes('mundo');
    const esConsultaComparativaNacionalMundo = mencionaNacionalLimpio && mencionaInternacionalLimpio;
    const esConsultaSoloNacional = mencionaNacionalLimpio && !mencionaInternacionalLimpio;
    const esConsultaSoloInternacional = mencionaInternacionalLimpio && !mencionaNacionalLimpio;
    // Detecta solicitud explícita de Resumen/Informe Anual (consulta global del año, con varios bloques de datos).
    const tieneInformeAnual = lowerText.includes('resumen anual') || lowerText.includes('informe anual') || (lowerText.includes('anual') && (lowerText.includes('resumen') || lowerText.includes('informe') || lowerText.includes('completo')));
    const tieneEventos = lowerText.includes('evento') && !tienePersonal && !tieneProvincias && !tieneMundo && !tieneInformeAnual;
    // Detecta consultas filtradas por tipo de registro en `registro_visitante.tipo_visita` (individual o grupo).
    // Cubre "registros individuales en mayo", "visitantes de grupo en abril 2025", "individuales hoy", etc.
    const tipoIndividualMencionado = lowerText.includes('individual'); // cubre "individual" e "individuales"
    const tipoGrupoMencionado = lowerText.includes('grupo'); // cubre "grupo" y "grupos"
    const contextoRegistro = lowerText.includes('registro') || lowerText.includes('visita') || lowerText.includes('visitante');
    const tieneFiltroTipoRegistro = contextoRegistro && (tipoIndividualMencionado || tipoGrupoMencionado) && !tieneEventos && !tienePersonal && !tieneInformeAnual;

    // Consultas por día específico
    const tieneHoy = lowerText.includes('hoy');
    const tieneAyer = lowerText.includes('ayer');

    // Detección de fecha completa en formato DD/MM/YYYY o DD-MM-YYYY (tiene preferencia sobre el resto)
    const matchFechaCompleta = lowerText.match(/\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b/);
    const matchDia = matchFechaCompleta ? null : lowerText.match(/\b(?:d[ií]a|el)\s+(\d{1,2})\b/);
    const tieneDiaEspecifico = tieneHoy || tieneAyer || matchFechaCompleta !== null || (matchDia !== null && parseInt(matchDia[1], 10) >= 1 && parseInt(matchDia[1], 10) <= 31);

    // Parsear mes y año específicos si se mencionan en la consulta
    // Si hay fecha completa DD/MM/YYYY, toma mes y año de ahí con prioridad absoluta
    const indiceMesSolicitado = matchFechaCompleta
      ? parseInt(matchFechaCompleta[2], 10) - 1
      : mesesNombres.findIndex(m => lowerText.includes(m));
    const targetMonthIndex = indiceMesSolicitado !== -1 ? indiceMesSolicitado : currentMonthIndex;
    const targetMesNombre = mesesNombres[targetMonthIndex];

    // targetYear definitivo: fecha completa > año suelto (matchAnio) > año actual
    const targetYear = matchFechaCompleta
      ? parseInt(matchFechaCompleta[3], 10)
      : targetYearBase;

    // Calcular las fechas de inicio y fin para el mes solicitado
    const inicioMes = `${targetYear}-${pad(targetMonthIndex + 1)}-01`;
    let finMes = '';
    if (targetMonthIndex === currentMonthIndex && targetYear === currentYear) {
      finMes = `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`;
    } else {
      const ultimoDia = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
      finMes = `${targetYear}-${pad(targetMonthIndex + 1)}-${pad(ultimoDia)}T23:59:59.999`;
    }

    // Consultar provincias, países y eventos en la BD
    let todasProvincias: { id_provincia: number; nombre_provincia: string }[] = [];
    let todosPaises: { id_pais: number; nombre_pais: string }[] = [];
    let todosEventos: EventoRow[] = [];
    try {
      const [provincias, paises, eventos] = await Promise.all([
        statsRepo.getProvincias(),
        statsRepo.getPaises(),
        statsRepo.getEventos(),
      ]);
      todasProvincias = provincias;
      todosPaises = paises;
      todosEventos = eventos;
    } catch (e) {
      console.error('Error cargando catálogos de provincias/países/eventos:', e);
    }

    const provEncontrada = todasProvincias.find(p =>
      lowerText.includes(p.nombre_provincia.toLowerCase())
    );
    const paisEncontrado = !provEncontrada
      ? todosPaises.find(p => lowerText.includes(p.nombre_pais.toLowerCase()))
      : undefined;

    // Buscar evento por nombre (case + accent insensitive, mínimo 4 caracteres para evitar
    // matches espurios con nombres muy cortos como "Test").
    const lowerTextNorm = stripAccents(lowerText);
    const eventoEncontrado = todosEventos.find(e =>
      e.nombre_evento &&
      e.nombre_evento.length >= 4 &&
      lowerTextNorm.includes(stripAccents(e.nombre_evento))
    );

    const esComparativaEspaniaMundo = (lowerText.includes('españa') || lowerText.includes('nacionales')) &&
      (lowerText.includes('mundo') || lowerText.includes('internacionales') || lowerText.includes('vs') || lowerText.includes('compar'));

    const tieneLugarEspecifico = (!!provEncontrada || !!paisEncontrado) && !esComparativaEspaniaMundo;

    // EVENTOS (activos, programados, por día/mes/año, pasados con asistencia, evento específico)
    if (tieneEventos) {
      try {
        // ── SUB-INTERCEPTOR: evento concreto mencionado por nombre ─────────────
        // Si el usuario menciona el nombre de un evento específico (ej: "evento Conferencia"),
        // mostramos sus visitantes con desglose por procedencia (nacional / internacional).
        if (eventoEncontrado) {
          const gruposEvento = await statsRepo.getGruposEnRango({
            idsEvento: [eventoEncontrado.id_evento],
          });

          let totalNacional = 0;
          let totalInternacional = 0;
          const provMap: Record<string, number> = {};
          const paisMap: Record<string, number> = {};

          gruposEvento.forEach((g) => {
            const cant = g.num_visitantes || 0;
            if (g.tipo_origen === 'provincia') {
              totalNacional += cant;
              const prov = g.origen || 'Desconocida';
              provMap[prov] = (provMap[prov] || 0) + cant;
            } else if (g.tipo_origen === 'pais') {
              const origen = g.origen || 'Otros';
              if (origen === 'España') {
                totalNacional += cant;
                provMap['Otras (Grupos)'] = (provMap['Otras (Grupos)'] || 0) + cant;
              } else {
                totalInternacional += cant;
                paisMap[origen] = (paisMap[origen] || 0) + cant;
              }
            }
          });

          const totalVisitantes = totalNacional + totalInternacional;
          const fechaEv = new Date(eventoEncontrado.fecha_inicio);
          const fechaFormateada = `${pad(fechaEv.getDate())}/${pad(fechaEv.getMonth() + 1)}/${fechaEv.getFullYear()}`;
          const estado = eventoEncontrado.finalizado ? '✅ Finalizado' : (fechaEv.getTime() < ahora.getTime() ? '🕒 Pendiente de cierre' : '📅 Programado');

          let respuestaTexto = `## 🎭 ${eventoEncontrado.nombre_evento}\n\n`;
          respuestaTexto += `📅 **Fecha:** ${fechaFormateada} (${estado})\n\n`;

          if (totalVisitantes === 0) {
            respuestaTexto += `Este evento todavía no tiene visitantes registrados.`;
          } else {
            respuestaTexto += `👥 **Visitantes totales:** ${totalVisitantes.toLocaleString('es-ES')}\n\n`;
            respuestaTexto += `### Procedencia\n`;
            respuestaTexto += `- 🇪🇸 **Nacionales:** ${totalNacional.toLocaleString('es-ES')} (${totalVisitantes > 0 ? ((totalNacional / totalVisitantes) * 100).toFixed(1) : 0}%)\n`;
            respuestaTexto += `- 🌍 **Internacionales:** ${totalInternacional.toLocaleString('es-ES')} (${totalVisitantes > 0 ? ((totalInternacional / totalVisitantes) * 100).toFixed(1) : 0}%)\n`;

            const listaProvincias = Object.entries(provMap)
              .map(([nombre, total]) => ({ nombre, total }))
              .sort((a, b) => b.total - a.total);
            const listaPaises = Object.entries(paisMap)
              .map(([nombre, total]) => ({ nombre, total }))
              .sort((a, b) => b.total - a.total);

            if (listaProvincias.length > 0) {
              respuestaTexto += `\n### 🇪🇸 Desglose por provincias\n`;
              listaProvincias.forEach((p) => {
                respuestaTexto += `- **${p.nombre}:** ${p.total.toLocaleString('es-ES')} visitantes\n`;
              });
            }
            if (listaPaises.length > 0) {
              respuestaTexto += `\n### 🌍 Desglose por países\n`;
              listaPaises.forEach((p) => {
                respuestaTexto += `- **${p.nombre}:** ${p.total.toLocaleString('es-ES')} visitantes\n`;
              });
            }
          }

          respuestaTexto += `\n\n*(Datos obtenidos en tiempo real de la base de datos de Visimap)*`;

          let graficos: GraficoGenerado[] | undefined;
          if (totalVisitantes > 0) {
            graficos = [{
              id: `grafico-${Date.now()}-procedencia`,
              tipo: 'bar',
              titulo: `Procedencia de visitantes — ${eventoEncontrado.nombre_evento}`,
              subtitulo: `Total: ${totalVisitantes.toLocaleString('es-ES')} visitantes`,
              datos: [{ name: eventoEncontrado.nombre_evento, Nacionales: totalNacional, Internacionales: totalInternacional }],
              claves: ['Nacionales', 'Internacionales'],
              claveX: 'name',
              colores: ['#3b82f6', '#ec4899'],
            }];
          }

          await new Promise(resolve => setTimeout(resolve, 600));
          setMensajes(prev =>
            prev.map(m =>
              m.id === idPlaceholder
                ? { ...m, texto: respuestaTexto, graficos, cargando: false }
                : m
            )
          );
          setIsLoading(false);
          scrollAlFinal();
          return;
        }

        // 1. Determinar rango de fechas si la consulta especifica un periodo
        let inicioFiltro: string | null = null;
        let finFiltro: string | null = null;
        let labelPeriodo = '';
        let modoConsulta: 'activos' | 'rango' = 'activos';
        let granularidad: 'dia' | 'mes' | 'anio' | null = null;

        // Detectar rango "entre <mes1> y <mes2>" o "del <mes1> al <mes2>"
        const mesesEncontrados = mesesNombres
          .map((m, idx) => ({ mes: m, idx, pos: lowerText.indexOf(m) }))
          .filter(x => x.pos >= 0)
          .sort((a, b) => a.pos - b.pos);
        const tienePalabraRango = /\bentre\b|\bdesde\b|\bdel\b/.test(lowerText) &&
          (/\sy\s|\sa\s|\bhasta\b|\sal\s/.test(lowerText));
        const esRangoEntreMeses = tienePalabraRango && mesesEncontrados.length >= 2;

        if (tieneDiaEspecifico) {
          let targetDate = new Date();
          let labelDia = 'hoy';

          if (tieneHoy) {
            targetDate = new Date();
            labelDia = 'hoy';
          } else if (tieneAyer) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            targetDate = d;
            labelDia = 'ayer';
          } else if (matchFechaCompleta) {
            const numeroDia = parseInt(matchFechaCompleta[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          } else if (matchDia) {
            const numeroDia = parseInt(matchDia[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          }

          const y = targetDate.getFullYear();
          const mm = pad(targetDate.getMonth() + 1);
          const dd = pad(targetDate.getDate());
          inicioFiltro = `${y}-${mm}-${dd}T00:00:00`;
          finFiltro = `${y}-${mm}-${dd}T23:59:59.999`;
          labelPeriodo = `${labelDia} (${dd}/${mm}/${y})`;
          modoConsulta = 'rango';
          granularidad = 'dia';
        } else if (esRangoEntreMeses) {
          // Rango "entre mes1 y mes2" / "del mes1 al mes2" — toma el primer y último mes mencionados
          const primer = mesesEncontrados[0];
          const ultimo = mesesEncontrados[mesesEncontrados.length - 1];
          const ultimoDia = new Date(targetYear, ultimo.idx + 1, 0).getDate();
          inicioFiltro = `${targetYear}-${pad(primer.idx + 1)}-01T00:00:00`;
          finFiltro = `${targetYear}-${pad(ultimo.idx + 1)}-${pad(ultimoDia)}T23:59:59.999`;
          labelPeriodo = `entre ${primer.mes} y ${ultimo.mes} de ${targetYear}`;
          modoConsulta = 'rango';
          granularidad = 'mes';
        } else if (indiceMesSolicitado !== -1) {
          const ultimoDia = new Date(targetYear, indiceMesSolicitado + 1, 0).getDate();
          inicioFiltro = `${targetYear}-${pad(indiceMesSolicitado + 1)}-01T00:00:00`;
          finFiltro = `${targetYear}-${pad(indiceMesSolicitado + 1)}-${pad(ultimoDia)}T23:59:59.999`;
          labelPeriodo = `${targetMesNombre} de ${targetYear}`;
          modoConsulta = 'rango';
          granularidad = 'mes';
        } else if (tieneAnio) {
          // Cubre tanto "2026" explícito como "este año" / "del año actual"
          inicioFiltro = `${targetYear}-01-01T00:00:00`;
          finFiltro = `${targetYear}-12-31T23:59:59.999`;
          labelPeriodo = `${targetYear}`;
          modoConsulta = 'rango';
          granularidad = 'anio';
        }

        // 2. Consultar eventos según modo
        const eventos = await statsRepo.getEventos(
          modoConsulta === 'rango' && inicioFiltro && finFiltro
            ? { inicio: inicioFiltro, fin: finFiltro }
            : { soloActivos: true }
        );

        // 3. Si hay un rango, obtener visitantes por evento (grupo_visitante.id_evento)
        let visitantesPorEvento: Record<number, number> = {};
        if (modoConsulta === 'rango' && eventos.length > 0) {
          const ids = eventos.map(e => e.id_evento);
          visitantesPorEvento = await statsRepo.getVisitantesPorEventos(ids);
        }

        // 4. Determinar si el periodo es pasado/presente/futuro (para adaptar el lenguaje)
        const ahoraTime = ahora.getTime();
        const finPeriodoTime = finFiltro ? new Date(finFiltro).getTime() : null;
        const inicioPeriodoTime = inicioFiltro ? new Date(inicioFiltro).getTime() : null;
        const esPasado = finPeriodoTime !== null && finPeriodoTime < ahoraTime;
        const esFuturo = inicioPeriodoTime !== null && inicioPeriodoTime > ahoraTime;
        const verbHaber = esPasado ? 'hubo' : 'hay';
        const verbHaberMayus = esPasado ? 'Hubo' : 'Hay';
        // Si labelPeriodo ya empieza por "entre" (rango entre meses), no añadimos preposición.
        const preposicionPeriodo = labelPeriodo.startsWith('entre')
          ? ''
          : (granularidad === 'dia' ? '' : (granularidad === 'anio' ? 'en el año ' : 'en '));

        // 5. Construir respuesta
        let respuestaTexto = '';
        if (modoConsulta === 'activos') {
          if (!eventos || eventos.length === 0) {
            respuestaTexto = `## Eventos activos o próximos\n\nNo hay **eventos activos o próximos** registrados en el museo en este momento.`;
          } else {
            const listado = eventos.map((ev: any) => {
              const d = new Date(ev.fecha_inicio);
              const fechaFormateada = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              return `- **${ev.nombre_evento}** — ${fechaFormateada}`;
            }).join('\n');
            const total = eventos.length;
            respuestaTexto = `## Eventos activos o próximos\n\nActualmente hay **${total}** evento${total === 1 ? '' : 's'} ${total === 1 ? 'programado' : 'programados'}:\n\n${listado}`;
          }
        } else {
          const tituloRango = `Eventos ${preposicionPeriodo}${labelPeriodo}`;
          if (!eventos || eventos.length === 0) {
            respuestaTexto = `## ${tituloRango}\n\nNo ${verbHaber} **eventos registrados** ${preposicionPeriodo}**${labelPeriodo}**.`;
          } else {
            const total = eventos.length;
            const listado = eventos.map((ev: any) => {
              const d = new Date(ev.fecha_inicio);
              const fechaFormateada = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              const estado = ev.finalizado
                ? '✅ Finalizado'
                : (new Date(ev.fecha_inicio).getTime() < ahoraTime ? '🕒 Pendiente de cierre' : '📅 Programado');
              const visitantes = visitantesPorEvento[ev.id_evento] || 0;
              let linea = `- **${ev.nombre_evento}** — ${fechaFormateada} (${estado})`;
              if (visitantes > 0) {
                linea += ` — 👥 **${visitantes.toLocaleString('es-ES')}** visitantes`;
              } else if (ev.finalizado) {
                linea += ` — 👥 Sin visitantes registrados`;
              }
              return linea;
            }).join('\n');

            const totalVisitantes = Object.values(visitantesPorEvento).reduce((acc, v) => acc + v, 0);
            const eventoPalabra = total === 1 ? 'evento' : 'eventos';
            const registradoPalabra = total === 1 ? 'registrado' : 'registrados';

            respuestaTexto = `## ${tituloRango}\n\n${verbHaberMayus} **${total}** ${eventoPalabra} ${registradoPalabra} ${preposicionPeriodo}**${labelPeriodo}**${esFuturo ? ' (todavía no celebrados)' : ''}:\n\n${listado}`;

            if (totalVisitantes > 0) {
              respuestaTexto += `\n\n👥 **Total de visitantes en ${total === 1 ? 'este evento' : 'estos eventos'}:** ${totalVisitantes.toLocaleString('es-ES')}`;
            }
          }
        }

        respuestaTexto += `\n\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de eventos:', dbErr);
      }
    }

    // REGISTROS POR TIPO (INDIVIDUAL / GRUPO)
    // Cubre "número total de registros individuales se han hecho en mayo",
    // "visitantes de grupo en abril 2025", "individuales hoy/ayer", "registros tipo grupo de 2024", etc.
    // Filtra `registro_visitante.tipo_visita` por día, mes o año. Soporta combinar con provincia/país.
    if (tieneFiltroTipoRegistro) {
      try {
        // Si menciona ambos, individual tiene preferencia (palabra más específica).
        const tipoVisita: 'individual' | 'grupo' = tipoIndividualMencionado ? 'individual' : 'grupo';

        // 1. Calcular rango de fechas según granularidad mencionada
        let inicio = '';
        let fin = '';
        let labelPeriodo = '';
        let granularidad: 'dia' | 'mes' | 'anio' = 'mes';

        if (tieneDiaEspecifico) {
          let targetDate = new Date();
          let labelDia = 'hoy';
          if (tieneHoy) {
            targetDate = new Date();
            labelDia = 'hoy';
          } else if (tieneAyer) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            targetDate = d;
            labelDia = 'ayer';
          } else if (matchFechaCompleta) {
            const numeroDia = parseInt(matchFechaCompleta[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          } else if (matchDia) {
            const numeroDia = parseInt(matchDia[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          }
          const y = targetDate.getFullYear();
          const mm = pad(targetDate.getMonth() + 1);
          const dd = pad(targetDate.getDate());
          inicio = `${y}-${mm}-${dd}T00:00:00`;
          fin = `${y}-${mm}-${dd}T23:59:59.999`;
          labelPeriodo = `${labelDia} (${dd}/${mm}/${y})`;
          granularidad = 'dia';
        } else if (tieneAnio && !tieneMes && indiceMesSolicitado === -1) {
          // Cubre tanto "2024" explícito como "este año" / "del año actual"
          inicio = `${targetYear}-01-01T00:00:00`;
          fin = (targetYear === currentYear)
            ? `${targetYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`
            : `${targetYear}-12-31T23:59:59.999`;
          labelPeriodo = `el año ${targetYear}`;
          granularidad = 'anio';
        } else {
          inicio = `${inicioMes}T00:00:00`;
          fin = finMes;
          labelPeriodo = `${targetMesNombre} de ${targetYear}`;
          granularidad = 'mes';
        }

        // 2. Construir filtros opcionales por lugar y delegar al repo
        let lugarLabel = '';
        const idProvincia = provEncontrada?.id_provincia;
        const idPais = !provEncontrada ? paisEncontrado?.id_pais : undefined;
        if (provEncontrada) {
          lugarLabel = ` procedentes de ${provEncontrada.nombre_provincia}`;
        } else if (paisEncontrado) {
          lugarLabel = ` procedentes de ${paisEncontrado.nombre_pais}`;
        }

        const data = await statsRepo.getRegistrosVisitante({
          inicio,
          fin,
          tipo: tipoVisita,
          idProvincia,
          idPais,
          seleccion: 'cantidadFecha',
        });

        const numRegistros = data?.length || 0;
        const totalVisitantes = data?.reduce((acc, r: any) => acc + (r.cantidad || 0), 0) || 0;
        const promedio = numRegistros > 0 ? (totalVisitantes / numRegistros) : 0;

        // 3. Determinar verbo (pasado vs presente/futuro)
        const finPeriodoTime = new Date(fin).getTime();
        const esPasado = finPeriodoTime < ahora.getTime();
        const verbHaber = esPasado ? 'se registraron' : 'se han registrado';
        const verbHaberNeg = esPasado ? 'se registraron' : 'se han registrado';
        const esIndividual = tipoVisita === 'individual';

        // 4. Construir respuesta unificada (una sola métrica destacada: nº de visitas)
        const tituloTipo = esIndividual ? 'Visitas individuales' : 'Visitas en grupo';
        let respuestaTexto = `## ${tituloTipo} — ${labelPeriodo}${lugarLabel}\n\n`;

        if (numRegistros === 0) {
          respuestaTexto += `No ${verbHaberNeg} **${esIndividual ? 'visitas individuales' : 'visitas en grupo'}** durante **${labelPeriodo}**${lugarLabel}.`;
        } else if (esIndividual) {
          // Para individuales: el nº de visitas suele coincidir con personas, salvo parejas/familias.
          if (numRegistros === totalVisitantes) {
            respuestaTexto += `Durante **${labelPeriodo}**${lugarLabel} ${verbHaber} **${numRegistros.toLocaleString('es-ES')}** visitas individuales (una persona cada una).`;
          } else {
            const extra = totalVisitantes - numRegistros;
            respuestaTexto += `Durante **${labelPeriodo}**${lugarLabel} ${verbHaber} **${numRegistros.toLocaleString('es-ES')}** visitas individuales, que suman **${totalVisitantes.toLocaleString('es-ES')}** personas en total.\n\n`;
            respuestaTexto += `*Casi todas son de 1 persona, pero ${extra === 1 ? 'una de las visitas se registró con 2 personas' : `${extra} visitas se registraron con más de una persona`} (parejas o familias pequeñas).*`;
          }
        } else {
          // Para grupo: lo relevante es nº de grupos y personas totales en ellos.
          respuestaTexto += `Durante **${labelPeriodo}**${lugarLabel} ${verbHaber} **${numRegistros.toLocaleString('es-ES')}** visitas en grupo, con un total de **${totalVisitantes.toLocaleString('es-ES')}** personas (promedio de **${promedio.toFixed(1)}** por grupo).`;
        }

        respuestaTexto += `\n\n*(Datos obtenidos en tiempo real de la base de datos de Visimap)*`;

        // 5. Gráfico opcional (solo si hay datos y la granularidad >= mes)
        let graficos: GraficoGenerado[] | undefined;
        if (numRegistros > 0 && granularidad !== 'dia') {
          const colorTipo = tipoVisita === 'individual' ? '#3b82f6' : '#9333ea';

          const labelTipoGrafico = esIndividual ? 'Visitas individuales' : 'Personas en visitas en grupo';
          const claveDato = esIndividual ? 'visitas' : 'personas';

          if (granularidad === 'anio') {
            const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const datosMes = mesesCortos.map(m => ({ mes: m, [claveDato]: 0 } as Record<string, string | number>));
            data?.forEach((r: any) => {
              const f = new Date(r.creado_en);
              if (f.getFullYear() === targetYear) {
                // Individual: cuenta de visitas (1 por registro). Grupo: personas totales.
                datosMes[f.getMonth()][claveDato] = (datosMes[f.getMonth()][claveDato] as number) + (esIndividual ? 1 : (r.cantidad || 0));
              }
            });
            graficos = [{
              id: `grafico-${Date.now()}`,
              tipo: 'bar',
              titulo: `${labelTipoGrafico} por mes (${targetYear})`,
              subtitulo: esIndividual
                ? `${numRegistros.toLocaleString('es-ES')} visitas en total`
                : `${numRegistros.toLocaleString('es-ES')} grupos — ${totalVisitantes.toLocaleString('es-ES')} personas`,
              datos: datosMes,
              claves: [claveDato],
              claveX: 'mes',
              colores: [colorTipo]
            }];
          } else {
            const ultimoDiaMes = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
            const totalDias = (targetMonthIndex === currentMonthIndex && targetYear === currentYear) ? ahora.getDate() : ultimoDiaMes;
            const datosDia: Record<string, string | number>[] = [];
            for (let d = 1; d <= totalDias; d++) {
              datosDia.push({ dia: `${d}`, [claveDato]: 0 });
            }
            data?.forEach((r: any) => {
              const f = new Date(r.creado_en);
              const dd = f.getDate();
              if (dd >= 1 && dd <= totalDias && f.getFullYear() === targetYear && f.getMonth() === targetMonthIndex) {
                datosDia[dd - 1][claveDato] = (datosDia[dd - 1][claveDato] as number) + (esIndividual ? 1 : (r.cantidad || 0));
              }
            });
            graficos = [{
              id: `grafico-${Date.now()}`,
              tipo: 'bar',
              titulo: `${labelTipoGrafico} por día (${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear})`,
              subtitulo: esIndividual
                ? `${numRegistros.toLocaleString('es-ES')} visitas en total`
                : `${numRegistros.toLocaleString('es-ES')} grupos — ${totalVisitantes.toLocaleString('es-ES')} personas`,
              datos: datosDia,
              claves: [claveDato],
              claveX: 'dia',
              colores: [colorTipo]
            }];
          }
        }

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de registros por tipo:', dbErr);
      }
    }

    // CONSULTA DE PROVINCIA/PAÍS ESPECÍFICO
    if (tieneLugarEspecifico && tieneVisitantes) {
      try {
        let inicio = '';
        let fin = '';
        let labelPeriodo = '';

        if (tieneDiaEspecifico) {
          let targetDate = new Date();
          let labelDia = 'hoy';
          if (tieneHoy) {
            targetDate = new Date();
            labelDia = 'hoy';
          } else if (tieneAyer) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            targetDate = d;
            labelDia = 'ayer';
          } else if (matchFechaCompleta) {
            const numeroDia = parseInt(matchFechaCompleta[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          } else if (matchDia) {
            const numeroDia = parseInt(matchDia[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          }
          const y = targetDate.getFullYear();
          const m = pad(targetDate.getMonth() + 1);
          const d = pad(targetDate.getDate());
          inicio = `${y}-${m}-${d}T00:00:00`;
          fin = `${y}-${m}-${d}T23:59:59.999`;
          labelPeriodo = `${labelDia} (${d}/${m}/${y})`;
        } else if ((lowerText.includes('año') || lowerText.includes('año actual') || matchAnio) && indiceMesSolicitado === -1 && !tieneMes) {
          inicio = `${targetYear}-01-01T00:00:00`;
          fin = `${targetYear}-12-31T23:59:59.999`;
          labelPeriodo = `en el año ${targetYear}`;
        } else {
          inicio = `${inicioMes}T00:00:00`;
          fin = finMes;
          labelPeriodo = `en ${targetMesNombre} de ${targetYear}`;
        }

        let totalIndividuales = 0;
        let totalGrupos = 0;
        let nombreLugar = '';

        if (provEncontrada) {
          nombreLugar = provEncontrada.nombre_provincia;

          const [registros, grupos] = await Promise.all([
            statsRepo.getRegistrosVisitante({
              inicio,
              fin,
              idProvincia: provEncontrada.id_provincia,
              seleccion: 'cantidad',
            }),
            statsRepo.getGruposEnRango({
              inicio,
              fin,
              tipoOrigen: 'provincia',
              origen: provEncontrada.nombre_provincia,
            }),
          ]);

          totalIndividuales = registros.reduce((acc, r) => acc + (r.cantidad || 0), 0);
          totalGrupos = grupos.reduce((acc, g) => acc + (g.num_visitantes || 0), 0);
        } else if (paisEncontrado) {
          nombreLugar = paisEncontrado.nombre_pais;

          const [registros, grupos] = await Promise.all([
            statsRepo.getRegistrosVisitante({
              inicio,
              fin,
              idPais: paisEncontrado.id_pais,
              seleccion: 'cantidad',
            }),
            statsRepo.getGruposEnRango({
              inicio,
              fin,
              tipoOrigen: 'pais',
              origen: paisEncontrado.nombre_pais,
            }),
          ]);

          totalIndividuales = registros.reduce((acc, r) => acc + (r.cantidad || 0), 0);
          totalGrupos = grupos.reduce((acc, g) => acc + (g.num_visitantes || 0), 0);
        }

        const totalGeneral = totalIndividuales + totalGrupos;

        let respuestaTexto = `El número total de visitantes registrado procedentes de **${nombreLugar}** **${labelPeriodo}** es de **${totalGeneral.toLocaleString('es-ES')}** personas.\n\n`;
        respuestaTexto += `**Desglose de visitas:**\n`;
        respuestaTexto += `- 🎫 **Ventanilla (individuales)**: **${totalIndividuales.toLocaleString('es-ES')}** visitantes\n`;
        respuestaTexto += `- 🎭 **Eventos / Grupos**: **${totalGrupos.toLocaleString('es-ES')}** visitantes\n\n`;
        respuestaTexto += `*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de provincia/país específico:', dbErr);
      }
    }

    // 1. RENDIMIENTO DEL PERSONAL
    if (tienePersonal) {
      try {
        const [perfiles, registros, eventosUsuarios, notas] = await Promise.all([
          statsRepo.getPerfilesActivos(),
          statsRepo.getRegistrosVisitante({
            inicio: `${inicioMes}T00:00:00`,
            fin: finMes,
            seleccion: 'idUsuario',
          }),
          statsRepo.getEventosUsuariosPorPeriodo(inicioMes, finMes),
          statsRepo.getNotasUsuariosPorPeriodo(inicioMes, finMes),
        ]);

        const mapa: Record<string, { nombre: string; registros: number; eventos: number; notas: number; total: number }> = {};

        perfiles.forEach((p) => {
          mapa[p.id] = {
            nombre: p.nombre || p.nombre_usuario || 'Desconocido',
            registros: 0,
            eventos: 0,
            notas: 0,
            total: 0
          };
        });

        registros.forEach((r) => {
          if (r.id_usuario && mapa[r.id_usuario]) mapa[r.id_usuario].registros += 1;
        });
        eventosUsuarios.forEach((e) => {
          if (mapa[e.id_usuario]) mapa[e.id_usuario].eventos += 1;
        });
        notas.forEach((n) => {
          if (mapa[n.creado_por]) mapa[n.creado_por].notas += 1;
        });

        const listaActividad = Object.entries(mapa).map(([id, val]) => ({
          id,
          name: val.nombre,
          registros: val.registros,
          eventos: val.eventos,
          notas: val.notas,
          total: val.registros + val.eventos + val.notas
        })).sort((a, b) => b.total - a.total);

        let respuestaTexto = `Aquí tienes el rendimiento detallado del personal durante el mes de **${targetMesNombre} de ${targetYear}**:\n\n`;
        listaActividad.forEach((t, idx) => {
          respuestaTexto += `${idx + 1}. **${t.name}**: **${t.total}** acciones en total (${t.registros} registros de visitas, ${t.eventos} eventos, ${t.notas} notas)\n`;
        });
        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const chartDatos = listaActividad.map(t => ({
          name: t.name,
          registros: t.registros,
          eventos: t.eventos,
          notas: t.notas,
          total: t.total
        }));

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'bar',
            titulo: `Actividad y Rendimiento del Personal (${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear})`,
            subtitulo: `Suma total de acciones por empleado`,
            datos: chartDatos,
            claves: ['registros', 'eventos', 'notas'],
            claveX: 'name',
            colores: ['#3b82f6', '#f59e0b', '#10b981']
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de rendimiento:', dbErr);
      }
    }

    // 2. RESUMEN ANUAL COMPLETO
    // Devuelve total anual, distribución mensual, top provincias, top países y eventos del año.
    if (tieneInformeAnual) {
      try {
        const inicioAnio = `${targetYear}-01-01T00:00:00`;
        const finAnio = (targetYear === currentYear)
          ? `${targetYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`
          : `${targetYear}-12-31T23:59:59.999`;

        const [vistaTotales, registros, grupos, eventosAnio] = await Promise.all([
          statsRepo.getVistaVisitantesTotales(),
          statsRepo.getRegistrosVisitante({
            inicio: inicioAnio,
            fin: finAnio,
            seleccion: 'cantidadFechaProvinciaPais',
          }),
          statsRepo.getGruposEnRango({ inicio: inicioAnio, fin: finAnio }),
          statsRepo.getEventos({ inicio: inicioAnio, fin: finAnio }),
        ]);

        // Total anual y desglose mensual usando la vista (incluye todo: ventanilla + eventos)
        const registrosAnio = vistaTotales.filter(item => {
          const f = new Date(item.fecha);
          return f.getFullYear() === targetYear;
        });

        const totalAnual = registrosAnio.reduce((acc, item) => acc + (item.total_personas || 0), 0);

        const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const datosPorMes: { mes: string; total: number }[] = mesesCortos.map(m => ({ mes: m, total: 0 }));

        registrosAnio.forEach(item => {
          const f = new Date(item.fecha);
          const mIdx = f.getMonth();
          datosPorMes[mIdx].total += (item.total_personas || 0);
        });

        // Top provincias (España) y top países (internacional)
        const provMap: Record<string, number> = {};
        const paisMap: Record<string, number> = {};

        registros.forEach((r) => {
          const paisNombre = r.pais?.nombre_pais || 'España';
          const cantidad = r.cantidad || 0;
          if (paisNombre === 'España') {
            const provNombre = r.provincia?.nombre_provincia || 'Desconocida';
            provMap[provNombre] = (provMap[provNombre] || 0) + cantidad;
          } else {
            paisMap[paisNombre] = (paisMap[paisNombre] || 0) + cantidad;
          }
        });

        grupos.forEach((g) => {
          const cantidad = g.num_visitantes || 0;
          if (g.tipo_origen === 'provincia') {
            const provNombre = g.origen || 'Desconocida';
            provMap[provNombre] = (provMap[provNombre] || 0) + cantidad;
          } else if (g.tipo_origen === 'pais') {
            const paisNombre = g.origen || 'Otros';
            if (paisNombre === 'España') {
              provMap['Otras (Grupos)'] = (provMap['Otras (Grupos)'] || 0) + cantidad;
            } else {
              paisMap[paisNombre] = (paisMap[paisNombre] || 0) + cantidad;
            }
          }
        });

        const topProvincias = Object.entries(provMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        const topPaises = Object.entries(paisMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        const totalEspana = Object.values(provMap).reduce((acc, v) => acc + v, 0);
        const totalMundo = Object.values(paisMap).reduce((acc, v) => acc + v, 0);
        const totalComparativa = totalEspana + totalMundo;
        const totalEventos = eventosAnio.length;

        // Mes con más visitantes
        let mejorMes = { mes: '—', total: 0 };
        datosPorMes.forEach(m => {
          if (m.total > mejorMes.total) mejorMes = m;
        });

        let respuestaTexto = `# 📊 Resumen Anual ${targetYear}\n\n`;
        respuestaTexto += `Durante el año **${targetYear}**${targetYear === currentYear ? ' (en lo que va de año)' : ''}, el museo ha recibido un total de **${totalAnual.toLocaleString('es-ES')}** visitantes.\n\n`;

        respuestaTexto += `### 📈 Indicadores clave\n`;
        respuestaTexto += `- 👥 **Visitantes totales:** ${totalAnual.toLocaleString('es-ES')}\n`;
        respuestaTexto += `- 🏆 **Mejor mes:** ${mejorMes.mes} con **${mejorMes.total.toLocaleString('es-ES')}** visitantes\n`;
        respuestaTexto += `- 🇪🇸 **Nacionales (España):** ${totalEspana.toLocaleString('es-ES')} (${totalComparativa > 0 ? ((totalEspana / totalComparativa) * 100).toFixed(1) : 0}%)\n`;
        respuestaTexto += `- 🌍 **Internacionales:** ${totalMundo.toLocaleString('es-ES')} (${totalComparativa > 0 ? ((totalMundo / totalComparativa) * 100).toFixed(1) : 0}%)\n`;
        respuestaTexto += `- 🎭 **Eventos celebrados:** ${totalEventos}\n\n`;

        respuestaTexto += `### 📅 Distribución mensual\n`;
        datosPorMes.forEach((m) => {
          const marker = m.mes === mejorMes.mes && m.total > 0 ? ' 🏆' : '';
          respuestaTexto += `- **${m.mes}:** ${m.total.toLocaleString('es-ES')} visitantes${marker}\n`;
        });

        respuestaTexto += `\n### 🇪🇸 Top provincias\n`;
        if (topProvincias.length === 0) {
          respuestaTexto += `No se han registrado visitas nacionales durante este año.\n`;
        } else {
          topProvincias.forEach((p, idx) => {
            respuestaTexto += `${idx + 1}. **${p.nombre}:** ${p.total.toLocaleString('es-ES')} visitantes\n`;
          });
        }

        respuestaTexto += `\n### 🌍 Top países\n`;
        if (topPaises.length === 0) {
          respuestaTexto += `No se han registrado visitas internacionales durante este año.\n`;
        } else {
          topPaises.forEach((p, idx) => {
            respuestaTexto += `${idx + 1}. **${p.nombre}:** ${p.total.toLocaleString('es-ES')} visitantes\n`;
          });
        }

        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}-mensual`,
            tipo: 'bar',
            titulo: `Evolución mensual de visitantes (${targetYear})`,
            subtitulo: `Total anual: ${totalAnual.toLocaleString('es-ES')} visitantes`,
            datos: datosPorMes,
            claves: ['total'],
            claveX: 'mes',
            colores: ['#3b82f6']
          }
        ];

        if (topProvincias.length > 0) {
          graficos.push({
            id: `grafico-${Date.now()}-provincias`,
            tipo: 'bar',
            titulo: `Top provincias (${targetYear})`,
            subtitulo: `Total nacionales: ${totalEspana.toLocaleString('es-ES')} visitantes`,
            datos: topProvincias,
            claves: ['total'],
            claveX: 'nombre',
            colores: ['#10b981']
          });
        }

        if (topPaises.length > 0) {
          graficos.push({
            id: `grafico-${Date.now()}-paises`,
            tipo: 'bar',
            titulo: `Top países (${targetYear})`,
            subtitulo: `Total internacionales: ${totalMundo.toLocaleString('es-ES')} visitantes`,
            datos: topPaises,
            claves: ['total'],
            claveX: 'nombre',
            colores: ['#ec4899']
          });
        }

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de resumen anual:', dbErr);
      }
    }

    // 3. DESGLOSE NACIONAL POR PROVINCIAS
    if (tieneProvincias && !tieneInformeAnual) {
      try {
        const [registros, grupos] = await Promise.all([
          statsRepo.getRegistrosVisitante({
            inicio: `${inicioMes}T00:00:00`,
            fin: finMes,
            seleccion: 'cantidadFechaProvinciaPais',
          }),
          statsRepo.getGruposEnRango({ inicio: `${inicioMes}T00:00:00`, fin: finMes }),
        ]);

        const mapaProvincias: Record<string, { normales: number; eventos: number }> = {};

        registros.forEach((r) => {
          if (r.pais?.nombre_pais !== 'España') return;
          const prov = r.provincia?.nombre_provincia ?? 'Desconocida';
          if (!mapaProvincias[prov]) mapaProvincias[prov] = { normales: 0, eventos: 0 };
          mapaProvincias[prov].normales += (r.cantidad || 0);
        });

        grupos.forEach((g) => {
          if (g.tipo_origen === 'provincia') {
            const prov = g.origen || 'Desconocida';
            if (!mapaProvincias[prov]) mapaProvincias[prov] = { normales: 0, eventos: 0 };
            mapaProvincias[prov].eventos += (g.num_visitantes || 0);
          }
        });

        const listaProvincias = Object.entries(mapaProvincias).map(([provincia, val]) => ({
          provincia,
          individuales: val.normales,
          grupos: val.eventos,
          total: val.normales + val.eventos
        })).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

        let respuestaTexto = `Desglose de visitantes nacionales por provincias durante el mes de **${targetMesNombre} de ${targetYear}**:\n\n`;
        if (listaProvincias.length === 0) {
          respuestaTexto += `No se han registrado visitas nacionales durante este mes.\n`;
        } else {
          listaProvincias.forEach((p, idx) => {
            respuestaTexto += `${idx + 1}. **${p.provincia}**: **${p.total}** visitantes (${p.individuales} individuales, ${p.grupos} en eventos)\n`;
          });
        }
        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'bar',
            titulo: `Procedencia Nacional por Provincias (${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear})`,
            subtitulo: `Total: ${listaProvincias.reduce((acc, curr) => acc + curr.total, 0)} visitantes`,
            datos: listaProvincias.slice(0, 10),
            claves: ['individuales', 'grupos'],
            claveX: 'provincia',
            colores: ['#3b82f6', '#9333ea']
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de provincias:', dbErr);
      }
    }

    // 4. INTERCEPTOR: SOLO NACIONALES o SOLO INTERNACIONALES (modo único, no comparativa)
    // Cubre "visitantes internacionales este año", "nacionales en mayo", "extranjeros del 15/04/2025", etc.
    // Distingue de la comparativa España vs Mundo (donde se mencionan ambos lados).
    if ((esConsultaSoloNacional || esConsultaSoloInternacional) && tieneVisitantes && !tienePersonal && !tieneProvincias && !tieneInformeAnual && !tieneFiltroTipoRegistro && !tieneLugarEspecifico) {
      try {
        const esInternacional = esConsultaSoloInternacional;
        const labelTipo = esInternacional ? 'internacionales' : 'nacionales';
        const labelTipoCap = esInternacional ? 'Internacionales' : 'Nacionales';
        const icono = esInternacional ? '🌍' : '🇪🇸';

        // 1. Calcular rango (día > año > mes; defecto = mes actual)
        let inicio = '';
        let fin = '';
        let labelPeriodo = '';
        let granularidad: 'dia' | 'mes' | 'anio' = 'mes';

        if (tieneDiaEspecifico) {
          let targetDate = new Date();
          let labelDia = 'hoy';
          if (tieneHoy) {
            targetDate = new Date();
            labelDia = 'hoy';
          } else if (tieneAyer) {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            targetDate = d;
            labelDia = 'ayer';
          } else if (matchFechaCompleta) {
            const numeroDia = parseInt(matchFechaCompleta[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          } else if (matchDia) {
            const numeroDia = parseInt(matchDia[1], 10);
            targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
            labelDia = `el día ${numeroDia}`;
          }
          const y = targetDate.getFullYear();
          const mm = pad(targetDate.getMonth() + 1);
          const dd = pad(targetDate.getDate());
          inicio = `${y}-${mm}-${dd}T00:00:00`;
          fin = `${y}-${mm}-${dd}T23:59:59.999`;
          labelPeriodo = `${labelDia} (${dd}/${mm}/${y})`;
          granularidad = 'dia';
        } else if (tieneAnio && !tieneMes && indiceMesSolicitado === -1) {
          inicio = `${targetYear}-01-01T00:00:00`;
          fin = (targetYear === currentYear)
            ? `${targetYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`
            : `${targetYear}-12-31T23:59:59.999`;
          labelPeriodo = `el año ${targetYear}`;
          granularidad = 'anio';
        } else {
          inicio = `${inicioMes}T00:00:00`;
          fin = finMes;
          labelPeriodo = `${targetMesNombre} de ${targetYear}`;
          granularidad = 'mes';
        }

        // 2. Resolver el id de España una sola vez
        const espanaPais = todosPaises.find(p => p.nombre_pais === 'España');
        const idEspana = espanaPais?.id_pais;

        // 3. Consultar registro_visitante (ventanilla) y grupo_visitante (eventos)
        const [datosReg, datosGrp] = await Promise.all([
          statsRepo.getRegistrosVisitante({
            inicio,
            fin,
            seleccion: 'cantidadFechaPais',
            ...(idEspana !== undefined
              ? (esInternacional ? { idPaisNot: idEspana } : { idPais: idEspana })
              : {}),
          }),
          statsRepo.getGruposEnRango({ inicio, fin }),
        ]);

        // 4. Sumas
        const totalVentanilla = datosReg.reduce((acc, r) => acc + (r.cantidad || 0), 0);

        let totalEventos = 0;
        datosGrp.forEach((g) => {
          const cant = g.num_visitantes || 0;
          if (esInternacional) {
            if (g.tipo_origen === 'pais' && g.origen !== 'España') totalEventos += cant;
          } else {
            if (g.tipo_origen === 'provincia' || (g.tipo_origen === 'pais' && g.origen === 'España')) totalEventos += cant;
          }
        });

        const totalVisitantes = totalVentanilla + totalEventos;

        // 5. Lenguaje pasado/presente
        const esPasado = new Date(fin).getTime() < ahora.getTime();
        const verbHaber = esPasado ? 'se registraron' : 'se han registrado';

        let respuestaTexto = `## ${icono} Visitantes ${labelTipoCap} — ${labelPeriodo}\n\n`;
        if (totalVisitantes === 0) {
          respuestaTexto += `No ${verbHaber} **visitantes ${labelTipo}** durante **${labelPeriodo}**.`;
        } else {
          respuestaTexto += `Durante **${labelPeriodo}** ${verbHaber} **${totalVisitantes.toLocaleString('es-ES')}** visitantes ${labelTipo}:\n\n`;
          respuestaTexto += `- 🎫 **Ventanilla**: ${totalVentanilla.toLocaleString('es-ES')} visitantes\n`;
          respuestaTexto += `- 🎭 **Eventos / Grupos**: ${totalEventos.toLocaleString('es-ES')} visitantes\n`;
        }
        respuestaTexto += `\n\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        // 6. Gráfico opcional según granularidad
        let graficos: GraficoGenerado[] | undefined;
        if (totalVisitantes > 0 && granularidad !== 'dia') {
          const colorTipo = esInternacional ? '#ec4899' : '#3b82f6';

          if (granularidad === 'anio') {
            const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const datosMes = mesesCortos.map(m => ({ mes: m, total: 0 }));
            datosReg.forEach(r => {
              if (!r.creado_en) return;
              const f = new Date(r.creado_en);
              if (f.getFullYear() === targetYear) datosMes[f.getMonth()].total += (r.cantidad || 0);
            });
            datosGrp.forEach((g) => {
              const cant = g.num_visitantes || 0;
              const aplica = esInternacional
                ? (g.tipo_origen === 'pais' && g.origen !== 'España')
                : (g.tipo_origen === 'provincia' || (g.tipo_origen === 'pais' && g.origen === 'España'));
              if (!aplica) return;
              const fEvt = g.evento?.fecha_inicio ? new Date(g.evento.fecha_inicio) : null;
              if (fEvt && fEvt.getFullYear() === targetYear) datosMes[fEvt.getMonth()].total += cant;
            });
            graficos = [{
              id: `grafico-${Date.now()}`,
              tipo: 'bar',
              titulo: `Visitantes ${labelTipo} por mes (${targetYear})`,
              subtitulo: `Total: ${totalVisitantes.toLocaleString('es-ES')} visitantes`,
              datos: datosMes,
              claves: ['total'],
              claveX: 'mes',
              colores: [colorTipo]
            }];
          } else {
            const ultimoDiaMes = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
            const totalDias = (targetMonthIndex === currentMonthIndex && targetYear === currentYear) ? ahora.getDate() : ultimoDiaMes;
            const datosDia: { dia: string; total: number }[] = [];
            for (let d = 1; d <= totalDias; d++) datosDia.push({ dia: `${d}`, total: 0 });
            datosReg.forEach(r => {
              if (!r.creado_en) return;
              const f = new Date(r.creado_en);
              const dd = f.getDate();
              if (dd >= 1 && dd <= totalDias && f.getFullYear() === targetYear && f.getMonth() === targetMonthIndex) {
                datosDia[dd - 1].total += (r.cantidad || 0);
              }
            });
            datosGrp.forEach((g) => {
              const cant = g.num_visitantes || 0;
              const aplica = esInternacional
                ? (g.tipo_origen === 'pais' && g.origen !== 'España')
                : (g.tipo_origen === 'provincia' || (g.tipo_origen === 'pais' && g.origen === 'España'));
              if (!aplica) return;
              const fEvt = g.evento?.fecha_inicio ? new Date(g.evento.fecha_inicio) : null;
              if (!fEvt) return;
              const dd = fEvt.getDate();
              if (dd >= 1 && dd <= totalDias && fEvt.getFullYear() === targetYear && fEvt.getMonth() === targetMonthIndex) {
                datosDia[dd - 1].total += cant;
              }
            });
            graficos = [{
              id: `grafico-${Date.now()}`,
              tipo: 'bar',
              titulo: `Visitantes ${labelTipo} por día (${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear})`,
              subtitulo: `Total: ${totalVisitantes.toLocaleString('es-ES')} visitantes`,
              datos: datosDia,
              claves: ['total'],
              claveX: 'dia',
              colores: [colorTipo]
            }];
          }
        }

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor de nacionales/internacionales:', dbErr);
      }
    }

    // 5. COMPARATIVA ESPAÑA VS MUNDO (PROCEDENCIA — MENSUAL O ANUAL)
    if (esConsultaComparativaNacionalMundo && !tienePersonal && !tieneProvincias && !tieneDiaEspecifico && !tieneInformeAnual && !tieneFiltroTipoRegistro) {
      try {
        // Si la consulta es anual (sin mes específico), usar todo el año; en otro caso, usar el mes.
        const esConsultaAnual = tieneAnio && !tieneMes;
        const rangoInicio = esConsultaAnual
          ? `${targetYear}-01-01T00:00:00`
          : `${inicioMes}T00:00:00`;
        const rangoFin = esConsultaAnual
          ? (targetYear === currentYear
            ? `${targetYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`
            : `${targetYear}-12-31T23:59:59.999`)
          : finMes;
        const labelPeriodo = esConsultaAnual
          ? `año ${targetYear}`
          : `${targetMesNombre} de ${targetYear}`;
        const labelPeriodoCorto = esConsultaAnual
          ? `${targetYear}`
          : `${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear}`;

        const [registros, grupos] = await Promise.all([
          statsRepo.getRegistrosVisitante({
            inicio: rangoInicio,
            fin: rangoFin,
            seleccion: 'cantidadFechaProvinciaPais',
          }),
          statsRepo.getGruposEnRango({ inicio: rangoInicio, fin: rangoFin }),
        ]);

        let totalEspana = 0;
        let totalMundo = 0;
        const provMap: Record<string, number> = {};
        const paisMap: Record<string, number> = {};

        registros.forEach((r) => {
          const paisNombre = r.pais?.nombre_pais || 'España';
          const cantidad = r.cantidad || 0;
          if (paisNombre === 'España') {
            totalEspana += cantidad;
            const provNombre = r.provincia?.nombre_provincia || 'Desconocida';
            provMap[provNombre] = (provMap[provNombre] || 0) + cantidad;
          } else {
            totalMundo += cantidad;
            paisMap[paisNombre] = (paisMap[paisNombre] || 0) + cantidad;
          }
        });

        grupos.forEach((g) => {
          const cantidad = g.num_visitantes || 0;
          if (g.tipo_origen === 'provincia') {
            totalEspana += cantidad;
            const provNombre = g.origen || 'Desconocida';
            provMap[provNombre] = (provMap[provNombre] || 0) + cantidad;
          } else if (g.tipo_origen === 'pais') {
            const paisNombre = g.origen || 'Otros';
            if (paisNombre === 'España') {
              totalEspana += cantidad;
              provMap['Otras (Grupos)'] = (provMap['Otras (Grupos)'] || 0) + cantidad;
            } else {
              totalMundo += cantidad;
              paisMap[paisNombre] = (paisMap[paisNombre] || 0) + cantidad;
            }
          }
        });

        const totalUnico = totalEspana + totalMundo;

        const listaProvincias = Object.entries(provMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total);

        const listaPaises = Object.entries(paisMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total);

        let respuestaTexto = `Comparativa de procedencia de visitantes para el **${labelPeriodo}**:\n\n`;
        respuestaTexto += `- 🇪🇸 **España (Nacionales)**: **${totalEspana.toLocaleString('es-ES')}** visitantes (${totalUnico > 0 ? ((totalEspana / totalUnico) * 100).toFixed(1) : 0}%)\n`;
        respuestaTexto += `- 🌎 **Resto del Mundo (Internacionales)**: **${totalMundo.toLocaleString('es-ES')}** visitantes (${totalUnico > 0 ? ((totalMundo / totalUnico) * 100).toFixed(1) : 0}%)\n\n`;

        respuestaTexto += `### 🇪🇸 Desglose por Provincias (España):\n`;
        if (listaProvincias.length === 0) {
          respuestaTexto += `No se han registrado visitas nacionales durante este periodo.\n`;
        } else {
          listaProvincias.forEach((p) => {
            respuestaTexto += `• **${p.nombre}**: ${p.total.toLocaleString('es-ES')} visitantes\n`;
          });
        }

        respuestaTexto += `\n### 🌎 Desglose por Países (Internacional):\n`;
        if (listaPaises.length === 0) {
          respuestaTexto += `No se han registrado visitas internacionales durante este periodo.\n`;
        } else {
          listaPaises.forEach((p) => {
            respuestaTexto += `• **${p.nombre}**: ${p.total.toLocaleString('es-ES')} visitantes\n`;
          });
        }

        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'bar',
            titulo: `Procedencia de Visitantes (${labelPeriodoCorto})`,
            subtitulo: `Total: ${totalUnico.toLocaleString('es-ES')} visitantes`,
            datos: [
              {
                name: labelPeriodoCorto,
                España: totalEspana,
                'Resto del Mundo': totalMundo
              }
            ],
            claves: ['España', 'Resto del Mundo'],
            claveX: 'name',
            colores: ['#3b82f6', '#ec4899']
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en interceptor España vs Mundo:', dbErr);
      }
    }

    // 6. VISITANTES POR DÍA ESPECÍFICO (HOY, AYER, DÍA X)
    if (tieneDiaEspecifico && tieneVisitantes) {
      try {
        let targetDate = new Date();
        let labelDia = 'hoy';

        if (tieneHoy) {
          targetDate = new Date();
          labelDia = 'hoy';
        } else if (tieneAyer) {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          targetDate = d;
          labelDia = 'ayer';
        } else if (matchFechaCompleta) {
          const numeroDia = parseInt(matchFechaCompleta[1], 10);
          targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
          labelDia = `el día ${numeroDia}`;
        } else if (matchDia) {
          const numeroDia = parseInt(matchDia[1], 10);
          targetDate = new Date(targetYear, targetMonthIndex, numeroDia);
          labelDia = `el día ${numeroDia}`;
        }

        const vistaData = await statsRepo.getVistaVisitantesTotales();

        const dia = targetDate.getDate();
        const mesIndex = targetDate.getMonth();
        const anio = targetDate.getFullYear();

        const registrosDia = vistaData.filter(item => {
          const f = new Date(item.fecha);
          return f.getDate() === dia && f.getMonth() === mesIndex && f.getFullYear() === anio;
        });

        const totalDia = registrosDia.reduce((acc, curr) => acc + (curr.total_personas || 0), 0);

        let ventanilla = 0;
        let eventos = 0;
        registrosDia.forEach(item => {
          const origen = String(item.origen || '').toLowerCase();
          if (origen.includes('individual') || origen.includes('ventanilla') || origen.includes('registro_visitante')) {
            ventanilla += (item.total_personas || 0);
          } else {
            eventos += (item.total_personas || 0);
          }
        });

        const fechaFormateada = `${pad(dia)}/${pad(mesIndex + 1)}/${anio}`;
        let respuestaTexto = `El número total de visitantes registrado **${labelDia} (${fechaFormateada})** es de **${totalDia}** personas.\n\n`;
        respuestaTexto += `**Desglose de visitas:**\n`;
        respuestaTexto += `- 🎫 **Ventanilla (individuales)**: **${ventanilla}** visitantes\n`;
        respuestaTexto += `- 🎭 **Eventos / Grupos**: **${eventos}** visitantes\n\n`;
        respuestaTexto += `*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'pie',
            titulo: `Visitas del Día (${fechaFormateada})`,
            subtitulo: `Total: ${totalDia} visitantes`,
            datos: [
              { name: 'Ventanilla', value: ventanilla },
              { name: 'Eventos/Grupos', value: eventos }
            ],
            claves: ['value'],
            claveX: 'name',
            colores: ['#3b82f6', '#f59e0b']
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en el interceptor de visitantes por día:', dbErr);
      }
    }

    // 7. VISITANTES DEL MES (EVOLUCIÓN MENSUAL + DESGLOSE SEMANAL)
    if (tieneMes && tieneVisitantes) {
      try {
        let totalDias = 0;
        if (targetMonthIndex === currentMonthIndex && targetYear === currentYear) {
          totalDias = ahora.getDate();
        } else {
          totalDias = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
        }

        const vistaData = await statsRepo.getVistaVisitantesTotales();

        const registrosMes = vistaData.filter(item => {
          const f = new Date(item.fecha);
          return f.getFullYear() === targetYear && f.getMonth() === targetMonthIndex;
        });

        const totalMes = registrosMes.reduce((acc, curr) => acc + (curr.total_personas || 0), 0);

        const datosEvolucion: { dia: string; total: number }[] = [];
        for (let d = 1; d <= totalDias; d++) {
          datosEvolucion.push({
            dia: `Día ${d}`,
            total: 0
          });
        }

        registrosMes.forEach(item => {
          const f = new Date(item.fecha);
          const d = f.getDate();
          if (d >= 1 && d <= totalDias) {
            datosEvolucion[d - 1].total += (item.total_personas || 0);
          }
        });

        let sem1 = 0, sem2 = 0, sem3 = 0, sem4 = 0, sem5 = 0;
        registrosMes.forEach(item => {
          const f = new Date(item.fecha);
          const d = f.getDate();
          const p = item.total_personas || 0;
          if (d <= 7) sem1 += p;
          else if (d <= 14) sem2 += p;
          else if (d <= 21) sem3 += p;
          else if (d <= 28) sem4 += p;
          else sem5 += p;
        });

        let respuestaTexto = `Durante el mes de **${targetMesNombre} de ${targetYear}** (del 1 al ${totalDias} de ${targetMesNombre}), el museo ha registrado un total de **${totalMes.toLocaleString('es-ES')}** visitantes.\n\n`;
        respuestaTexto += `Aquí tienes el desglose detallado de visitas por semanas:\n`;
        respuestaTexto += `- **Semana 1 (01/${pad(targetMonthIndex + 1)} - 07/${pad(targetMonthIndex + 1)}):** **${sem1.toLocaleString('es-ES')}** visitantes\n`;
        if (totalDias >= 8) {
          const finSem2 = Math.min(14, totalDias);
          respuestaTexto += `- **Semana 2 (08/${pad(targetMonthIndex + 1)} - ${pad(finSem2)}/${pad(targetMonthIndex + 1)}):** **${sem2.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 15) {
          const finSem3 = Math.min(21, totalDias);
          respuestaTexto += `- **Semana 3 (15/${pad(targetMonthIndex + 1)} - ${pad(finSem3)}/${pad(targetMonthIndex + 1)}):** **${sem3.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 22) {
          const finSem4 = Math.min(28, totalDias);
          respuestaTexto += `- **Semana 4 (22/${pad(targetMonthIndex + 1)} - ${pad(finSem4)}/${pad(targetMonthIndex + 1)}):** **${sem4.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 29) {
          respuestaTexto += `- **Semana 5 (29/${pad(targetMonthIndex + 1)} - ${pad(totalDias)}/${pad(targetMonthIndex + 1)}):** **${sem5.toLocaleString('es-ES')}** visitantes\n`;
        }
        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'area',
            titulo: `Evolución Diaria de Visitantes (${targetMesNombre.charAt(0).toUpperCase() + targetMesNombre.slice(1)} ${targetYear})`,
            subtitulo: `Total acumulado: ${totalMes.toLocaleString('es-ES')} visitantes`,
            datos: datosEvolucion,
            claves: ['total'],
            claveX: 'dia',
            colores: ['#3b82f6']
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, graficos, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en el interceptor de visitantes del mes:', dbErr);
      }
    }

    // 8. VISITANTES ANUALES O TOTAL HISTÓRICO
    if (tieneVisitantes && (tieneAnio || tieneTotalHistorico)) {
      try {
        const vistaData = await statsRepo.getVistaVisitantesTotales();

        let totalAnual = 0;
        let totalHistorico = 0;

        vistaData.forEach(item => {
          const fecha = new Date(item.fecha);
          const anio = fecha.getFullYear();
          const personas = item.total_personas || 0;

          totalHistorico += personas;
          if (anio === (tieneAnio ? targetYear : currentYear)) {
            totalAnual += personas;
          }
        });

        let respuestaTexto = '';
        if (tieneAnio) {
          respuestaTexto = `Durante el año **${targetYear}**, el museo ha registrado un total de **${totalAnual.toLocaleString('es-ES')}** visitantes. \n\nAdemás, si te interesa el acumulado completo, el total histórico de visitas registradas en la plataforma desde el inicio es de **${totalHistorico.toLocaleString('es-ES')}** visitantes.`;
        } else {
          respuestaTexto = `El total histórico acumulado de visitas registradas en el museo desde el inicio de los registros es de **${totalHistorico.toLocaleString('es-ES')}** visitantes.\n\nDurante el año actual (**${currentYear}**), hemos recibido un total de **${totalAnual.toLocaleString('es-ES')}** visitantes.`;
        }

        respuestaTexto += `\n\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        await new Promise(resolve => setTimeout(resolve, 600));
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? { ...m, texto: respuestaTexto, cargando: false }
              : m
          )
        );
        setIsLoading(false);
        scrollAlFinal();
        return;
      } catch (dbErr) {
        console.error('Error en el interceptor de visitantes de la IA:', dbErr);
      }
    }

    try {
      // Primera llamada a Groq
      const respuesta = await openaiService.enviarMensaje(texto.trim(), archivosActuales);

      // Si Groq pidió datos de BD, los ejecutamos y hacemos una segunda llamada
      if (respuesta.consultas.length > 0) {
        const consulta = respuesta.consultas[0]; // procesamos la primera consulta
        let resultados: unknown[] = [];
        let errorConsulta: string | undefined;

        try {
          const resultado = await ejecutarConsultaDB(consulta);
          resultados = resultado.datos;
          errorConsulta = resultado.errorMsg;
        } catch (_err) {
          resultados = [];
          errorConsulta = 'Error desconocido al ejecutar la consulta';
        }

        // Construir mensaje de contexto
        let mensajeContexto = 'Ahora usa estos datos para responder al usuario y generar el gráfico o análisis solicitado.';
        if (errorConsulta) {
          mensajeContexto = `La consulta a la tabla "${consulta.tabla}" falló con el error: ${errorConsulta}. Informa al usuario que no se pudieron obtener los datos y sugiere simplificar la consulta.`;
        } else if (resultados.length === 0) {
          mensajeContexto = `La consulta a la tabla "${consulta.tabla}" con los filtros aplicados devolvió 0 resultados (array vacío). No hay datos para el período solicitado. Informa al usuario de esto claramente y NO generes ningún gráfico.`;
        }

        // Segunda llamada con los datos como contexto
        const respuestaFinal = await openaiService.enviarMensaje(
          mensajeContexto,
          [],
          resultados.length > 0 ? { consulta, resultados } : undefined
        );

        // Usamos solo los gráficos de la respuesta final (evita duplicados si la IA generó un placeholder)
        const graficosFinales: GraficoGenerado[] = respuestaFinal.graficos.length > 0
          ? respuestaFinal.graficos
          : respuesta.graficos;

        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? {
                ...m,
                texto: respuestaFinal.texto || m.texto,
                graficos: graficosFinales.length > 0 ? graficosFinales : undefined,
                cargando: false,
              }
              : m
          )
        );
      } else {
        // Sin consultas DB — respuesta directa
        setMensajes(prev =>
          prev.map(m =>
            m.id === idPlaceholder
              ? {
                ...m,
                texto: respuesta.texto,
                graficos: respuesta.graficos.length > 0 ? respuesta.graficos : undefined,
                cargando: false,
              }
              : m
          )
        );
      }
    } catch (error: any) {
      console.error('[useChatIA] Error enviando mensaje:', error);

      let mensajeError = 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.';

      // Manejo específico de errores de Groq (Rate Limits)
      if (error?.status === 429 || error?.message?.includes('429')) {
        mensajeError = 'He alcanzado el límite de velocidad temporal de la IA. Por favor, espera unos 10-15 segundos antes de volver a preguntar para que pueda procesarlo correctamente.';
      } else if (error?.status === 503 || error?.message?.includes('503')) {
        mensajeError = 'El servicio de IA está temporalmente sobrecargado. Inténtalo de nuevo en un momento.';
      }

      setMensajes(prev =>
        prev.map(m =>
          m.id === idPlaceholder
            ? {
              ...m,
              texto: mensajeError,
              cargando: false,
              error: true,
            }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      scrollAlFinal();
    }
  }, [adjuntos, isLoading, scrollAlFinal]);

  // ── Limpiar chat ───────────────────────────────────────────────────────────

  const limpiarChat = useCallback(() => {
    setMensajes([]);
    setAdjuntos([]);
    openaiService.limpiarHistorial();
    // Revocar Object URLs pendientes
    adjuntos.forEach(a => URL.revokeObjectURL(a.previewUrl));
  }, [adjuntos]);

  return {
    mensajes,
    adjuntos,
    isLoading,
    ultimoMensajeRef,
    enviarMensaje,
    agregarArchivo,
    eliminarArchivo,
    limpiarChat,
  };
}
