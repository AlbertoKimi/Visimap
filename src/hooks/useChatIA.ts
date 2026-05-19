/**
 * Custom Hook que orquesta toda la lógica del Asistente Virtual (Chat IA).
 * Maneja el estado de los mensajes, carga de adjuntos y la doble llamada (Query -> Analizar)
 * requerida para procesar solicitudes de datos.
 * @module
 */
import { useState, useCallback, useRef } from 'react';
import { openaiService } from '@/database/openai/openaiService';
import { supabase } from '@/database/supabase/client';
import { ICONOS } from '@/constantes/iconos';
import type {
  MensajeChat,
  ArchivoAdjunto,
  GraficoGenerado,
  ConsultaDB,
  SugerenciaChat,
} from '@/interfaces/ChatIA';

// ──────────────────────────────────────────────────────────────────────────────
// Sugerencias rápidas
// ──────────────────────────────────────────────────────────────────────────────

/** Batería de sugerencias (Pills) iniciales para guiar al usuario */
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
    etiqueta: 'Resumen mensual',
    prompt: 'Crea un informe completo del mes actual con los principales datos del museo.',
    icono: ICONOS.resumen,
  },
  {
    etiqueta: 'Eventos activos',
    prompt: '¿Qué eventos hay activos o próximos? Dame un listado con sus fechas.',
    icono: ICONOS.mascaras,
  },
  {
    etiqueta: 'España vs Mundo',
    prompt: 'Compara los visitantes nacionales (España) vs internacionales de este mes.',
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


    // INTERCEPTOR DE CONSULTAS DE VISITANTES Y ESTADÍSTICAS EN TIEMPO REAL

    const lowerText = texto.toLowerCase().trim();
    const tieneVisitantes = lowerText.includes('visitante') || lowerText.includes('visita') || lowerText.includes('persona') || lowerText.includes('gente');
    const tieneAnio = lowerText.includes('este año') || lowerText.includes('de este año') || lowerText.includes('del año') || lowerText.includes('en lo que va de año') || lowerText.includes('este 2026') || lowerText.includes('en 2026') || (lowerText.includes('año') && (lowerText.includes('actual') || lowerText.includes('este')));
    const tieneTotalHistorico = lowerText.includes('total') || lowerText.includes('histórico') || lowerText.includes('historico') || lowerText.includes('acumulado') || lowerText.includes('todos los tiempos');
    const tieneMes = lowerText.includes('mes') || lowerText.includes('mensual');
    const tienePersonal = lowerText.includes('personal') || lowerText.includes('rendimiento') || lowerText.includes('trabajador') || lowerText.includes('empleado');
    const tieneProvincias = lowerText.includes('provincia') || lowerText.includes('provincias');
    const tieneMundo = lowerText.includes('españa') || lowerText.includes('mundo') || lowerText.includes('extranjero') || lowerText.includes('nacional') || lowerText.includes('internacional');
    const tieneEventos = lowerText.includes('evento') && !tienePersonal && !tieneProvincias && !tieneMundo;

    // Consultas por día específico
    const tieneHoy = lowerText.includes('hoy');
    const tieneAyer = lowerText.includes('ayer');
    const matchDia = lowerText.match(/(?:d[ií]a|el)\s+(\d{1,2})/);
    const tieneDiaEspecifico = tieneHoy || tieneAyer || (matchDia !== null && parseInt(matchDia[1], 10) >= 1 && parseInt(matchDia[1], 10) <= 31);

    const ahora = new Date();
    const currentYear = ahora.getFullYear();
    const currentMonthIndex = ahora.getMonth();
    const mesNombre = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][currentMonthIndex];
    const pad = (n: number) => String(n).padStart(2, '0');

    // INTERCEPTOR: EVENTOS ACTIVOS
    if (tieneEventos) {
      try {
        const { data: eventos, error } = await supabase
          .from('evento')
          .select('nombre_evento, fecha_inicio, finalizado')
          .neq('finalizado', true)
          .order('fecha_inicio', { ascending: true });

        if (error) throw error;

        let respuestaTexto = '';
        if (!eventos || eventos.length === 0) {
          respuestaTexto = 'No hay eventos activos o próximos.';
        } else {
          respuestaTexto = eventos.map((ev: any) => {
            const d = new Date(ev.fecha_inicio);
            const fechaFormateada = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
            return `• ${ev.nombre_evento}: ${fechaFormateada}`;
          }).join('\n');
        }

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
        console.error('Error en interceptor de eventos activos:', dbErr);
      }
    }

    // 1. INTERCEPTOR: RENDIMIENTO DEL PERSONAL
    if (tienePersonal) {
      try {
        const inicioMes = `${currentYear}-${pad(currentMonthIndex + 1)}-01`;
        const finMes = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`;

        const [resPerfiles, resReg, resEvt, resNot] = await Promise.all([
          supabase.from('profiles').select('id, nombre, nombre_usuario').eq('active', true),
          supabase.from('registro_visitante').select('id_usuario, creado_en').gte('creado_en', inicioMes).lte('creado_en', finMes),
          supabase.from('evento').select('id_usuario, fecha_inicio').gte('fecha_inicio', inicioMes).lte('fecha_inicio', finMes),
          supabase.from('notas').select('creado_por, creado_en').gte('creado_en', inicioMes).lte('creado_en', finMes)
        ]);

        if (resPerfiles.error) throw resPerfiles.error;

        const perfiles = resPerfiles.data || [];
        const mapa: Record<string, { nombre: string; registros: number; eventos: number; notas: number; total: number }> = {};
        
        perfiles.forEach((p: any) => {
          mapa[p.id] = {
            nombre: p.nombre || p.nombre_usuario || 'Desconocido',
            registros: 0,
            eventos: 0,
            notas: 0,
            total: 0
          };
        });

        if (resReg.data) {
          resReg.data.forEach((r: any) => {
            if (mapa[r.id_usuario]) mapa[r.id_usuario].registros += 1;
          });
        }
        if (resEvt.data) {
          resEvt.data.forEach((e: any) => {
            if (mapa[e.id_usuario]) mapa[e.id_usuario].eventos += 1;
          });
        }
        if (resNot.data) {
          resNot.data.forEach((n: any) => {
            if (mapa[n.creado_por]) mapa[n.creado_por].notas += 1;
          });
        }

        const listaActividad = Object.entries(mapa).map(([id, val]) => ({
          id,
          name: val.nombre,
          registros: val.registros,
          eventos: val.eventos,
          notas: val.notas,
          total: val.registros + val.eventos + val.notas
        })).sort((a, b) => b.total - a.total);

        let respuestaTexto = `Aquí tienes el rendimiento detallado del personal durante el mes de **${mesNombre} de ${currentYear}**:\n\n`;
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
            titulo: `Actividad y Rendimiento del Personal (${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${currentYear})`,
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

    // 2. INTERCEPTOR: DESGLOSE NACIONAL POR PROVINCIAS
    if (tieneProvincias) {
      try {
        const inicioMes = `${currentYear}-${pad(currentMonthIndex + 1)}-01`;
        const finMes = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`;

        const [resNorm, resGrp] = await Promise.all([
          supabase.from('registro_visitante')
            .select('cantidad, creado_en, provincia:id_provincia(nombre_provincia), pais:id_pais(nombre_pais)')
            .gte('creado_en', inicioMes).lte('creado_en', finMes),
          supabase.from('grupo_visitante')
            .select(`
              num_visitantes,
              tipo_origen,
              origen,
              evento!inner (
                fecha_inicio
              )
            `)
            .gte('evento.fecha_inicio', inicioMes).lte('evento.fecha_inicio', finMes)
        ]);

        const mapaProvincias: Record<string, { normales: number; eventos: number }> = {};

        if (resNorm.data) {
          resNorm.data.forEach((r: any) => {
            if (r.pais?.nombre_pais !== 'España') return;
            const prov = r.provincia?.nombre_provincia ?? 'Desconocida';
            if (!mapaProvincias[prov]) mapaProvincias[prov] = { normales: 0, eventos: 0 };
            mapaProvincias[prov].normales += (r.cantidad || 0);
          });
        }

        if (resGrp.data) {
          resGrp.data.forEach((g: any) => {
            if (g.tipo_origen === 'provincia') {
              const prov = g.origen;
              if (!mapaProvincias[prov]) mapaProvincias[prov] = { normales: 0, eventos: 0 };
              mapaProvincias[prov].eventos += (g.num_visitantes || 0);
            }
          });
        }

        const listaProvincias = Object.entries(mapaProvincias).map(([provincia, val]) => ({
          provincia,
          individuales: val.normales,
          grupos: val.eventos,
          total: val.normales + val.eventos
        })).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

        let respuestaTexto = `Desglose de visitantes nacionales por provincias durante el mes de **${mesNombre} de ${currentYear}**:\n\n`;
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
            titulo: `Procedencia Nacional por Provincias (${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${currentYear})`,
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

    // 3. INTERCEPTOR: COMPARATIVA ESPAÑA VS MUNDO (PROCEDENCIA)
    if (tieneMundo && !tienePersonal && !tieneProvincias && !tieneDiaEspecifico && !tieneAnio && !tieneTotalHistorico) {
      try {
        const inicioMes = `${currentYear}-${pad(currentMonthIndex + 1)}-01`;
        const finMes = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(ahora.getDate())}T23:59:59.999`;

        const [resNorm, resGrp] = await Promise.all([
          supabase.from('registro_visitante')
            .select('cantidad, creado_en, provincia:id_provincia(nombre_provincia), pais:id_pais(nombre_pais)')
            .gte('creado_en', inicioMes).lte('creado_en', finMes),
          supabase.from('grupo_visitante')
            .select(`
              num_visitantes,
              tipo_origen,
              origen,
              evento!inner (
                fecha_inicio
              )
            `)
            .gte('evento.fecha_inicio', inicioMes).lte('evento.fecha_inicio', finMes)
        ]);

        if (resNorm.error) throw resNorm.error;
        if (resGrp.error) throw resGrp.error;

        let totalEspana = 0;
        let totalMundo = 0;
        const provMap: Record<string, number> = {};
        const paisMap: Record<string, number> = {};

        if (resNorm.data) {
          resNorm.data.forEach((r: any) => {
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
        }

        if (resGrp.data) {
          resGrp.data.forEach((g: any) => {
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
        }

        const totalUnico = totalEspana + totalMundo;

        const listaProvincias = Object.entries(provMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total);

        const listaPaises = Object.entries(paisMap)
          .map(([nombre, total]) => ({ nombre, total }))
          .sort((a, b) => b.total - a.total);

        let respuestaTexto = `Comparativa de procedencia de visitantes para el mes de **${mesNombre} de ${currentYear}**:\n\n`;
        respuestaTexto += `- 🇪🇸 **España (Nacionales)**: **${totalEspana.toLocaleString('es-ES')}** visitantes (${totalUnico > 0 ? ((totalEspana / totalUnico) * 100).toFixed(1) : 0}%)\n`;
        respuestaTexto += `- 🌎 **Resto del Mundo (Internacionales)**: **${totalMundo.toLocaleString('es-ES')}** visitantes (${totalUnico > 0 ? ((totalMundo / totalUnico) * 100).toFixed(1) : 0}%)\n\n`;

        respuestaTexto += `### 🇪🇸 Desglose por Provincias (España):\n`;
        if (listaProvincias.length === 0) {
          respuestaTexto += `No se han registrado visitas nacionales durante este mes.\n`;
        } else {
          listaProvincias.forEach((p) => {
            respuestaTexto += `• **${p.nombre}**: ${p.total.toLocaleString('es-ES')} visitantes\n`;
          });
        }

        respuestaTexto += `\n### 🌎 Desglose por Países (Internacional):\n`;
        if (listaPaises.length === 0) {
          respuestaTexto += `No se han registrado visitas internacionales durante este mes.\n`;
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
            titulo: `Procedencia de Visitantes (${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${currentYear})`,
            subtitulo: `Total: ${totalUnico.toLocaleString('es-ES')} visitantes`,
            datos: [
              {
                name: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
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

    // 4. INTERCEPTOR: VISITANTES POR DÍA ESPECÍFICO (HOY, AYER, DÍA X)
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
        } else if (matchDia) {
          const numeroDia = parseInt(matchDia[1], 10);
          const d = new Date();
          d.setDate(numeroDia);
          targetDate = d;
          labelDia = `el día ${numeroDia}`;
        }

        const { data: vistaData, error: vistaError } = await supabase
          .from('vista_visitantes_totales')
          .select('total_personas, fecha, origen');

        if (vistaError) throw vistaError;

        const dia = targetDate.getDate();
        const mesIndex = targetDate.getMonth();
        const anio = targetDate.getFullYear();

        const registrosDia = (vistaData || []).filter(item => {
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

    // 5. INTERCEPTOR: VISITANTES DEL MES (EVOLUCIÓN MENSUAL + DESGLOSE SEMANAL)
    if (tieneMes && tieneVisitantes) {
      try {
        const totalDias = ahora.getDate();

        const { data: vistaData, error: vistaError } = await supabase
          .from('vista_visitantes_totales')
          .select('total_personas, fecha');

        if (vistaError) throw vistaError;

        const registrosMes = (vistaData || []).filter(item => {
          const f = new Date(item.fecha);
          return f.getFullYear() === currentYear && f.getMonth() === currentMonthIndex;
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

        let respuestaTexto = `Durante el mes de **${mesNombre} de ${currentYear}** (del 1 al ${totalDias} de ${mesNombre}), el museo ha registrado un total de **${totalMes.toLocaleString('es-ES')}** visitantes.\n\n`;
        respuestaTexto += `Aquí tienes el desglose detallado de visitas por semanas:\n`;
        respuestaTexto += `- **Semana 1 (01/${pad(currentMonthIndex + 1)} - 07/${pad(currentMonthIndex + 1)}):** **${sem1.toLocaleString('es-ES')}** visitantes\n`;
        if (totalDias >= 8) {
          const finSem2 = Math.min(14, totalDias);
          respuestaTexto += `- **Semana 2 (08/${pad(currentMonthIndex + 1)} - ${pad(finSem2)}/${pad(currentMonthIndex + 1)}):** **${sem2.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 15) {
          const finSem3 = Math.min(21, totalDias);
          respuestaTexto += `- **Semana 3 (15/${pad(currentMonthIndex + 1)} - ${pad(finSem3)}/${pad(currentMonthIndex + 1)}):** **${sem3.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 22) {
          const finSem4 = Math.min(28, totalDias);
          respuestaTexto += `- **Semana 4 (22/${pad(currentMonthIndex + 1)} - ${pad(finSem4)}/${pad(currentMonthIndex + 1)}):** **${sem4.toLocaleString('es-ES')}** visitantes\n`;
        }
        if (totalDias >= 29) {
          respuestaTexto += `- **Semana 5 (29/${pad(currentMonthIndex + 1)} - ${pad(totalDias)}/${pad(currentMonthIndex + 1)}):** **${sem5.toLocaleString('es-ES')}** visitantes\n`;
        }
        respuestaTexto += `\n*(Este dato es completamente exacto y se obtiene en tiempo real de la base de datos de Visimap)*`;

        const graficos: GraficoGenerado[] = [
          {
            id: `grafico-${Date.now()}`,
            tipo: 'area',
            titulo: `Evolución Diaria de Visitantes (${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${currentYear})`,
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

    // 6. INTERCEPTOR ORIGINAL: VISITANTES ANUALES O TOTAL HISTÓRICO
    if (tieneVisitantes && (tieneAnio || tieneTotalHistorico)) {
      try {
        const { data: vistaData, error: vistaError } = await supabase
          .from('vista_visitantes_totales')
          .select('total_personas, fecha');

        if (vistaError) throw vistaError;

        let totalAnual = 0;
        let totalHistorico = 0;

        vistaData?.forEach(item => {
          const fecha = new Date(item.fecha);
          const anio = fecha.getFullYear();
          const personas = item.total_personas || 0;

          totalHistorico += personas;
          if (anio === currentYear) {
            totalAnual += personas;
          }
        });

        let respuestaTexto = '';
        if (tieneAnio) {
          respuestaTexto = `Actualmente en el año **${currentYear}**, el museo ha registrado un total de **${totalAnual.toLocaleString('es-ES')}** visitantes. \n\nAdemás, si te interesa el acumulado completo, el total histórico de visitas registradas en la plataforma desde el inicio es de **${totalHistorico.toLocaleString('es-ES')}** visitantes.`;
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
