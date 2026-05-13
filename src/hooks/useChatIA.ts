/**
 * Custom Hook que orquesta toda la lógica del Asistente Virtual (Chat IA).
 * Maneja el estado de los mensajes, carga de adjuntos y la doble llamada (Query -> Analizar)
 * requerida para procesar solicitudes de datos.
 * @module
 */
import { useState, useCallback, useRef } from 'react';
import { openaiService } from '@/database/openai/openaiService';
import { supabase } from '@/database/supabase/client';
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
    icono: '📊',
  },
  {
    etiqueta: 'Gráfico por provincias',
    prompt: 'Genera un gráfico de barras con los visitantes por provincia del mes actual.',
    icono: '🗺️',
  },
  {
    etiqueta: 'Rendimiento del personal',
    prompt: 'Muéstrame el rendimiento del personal: ¿quién ha registrado más visitantes este mes?',
    icono: '👥',
  },
  {
    etiqueta: 'Resumen mensual',
    prompt: 'Crea un informe completo del mes actual con los principales datos del museo.',
    icono: '📄',
  },
  {
    etiqueta: 'Eventos activos',
    prompt: '¿Qué eventos hay activos o próximos? Dame un listado con sus fechas.',
    icono: '🎭',
  },
  {
    etiqueta: 'España vs Mundo',
    prompt: 'Compara los visitantes nacionales (España) vs internacionales de este mes.',
    icono: '🌍',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Ejecutor de consultas DB generadas por Gemini
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
    query = query.gte(consulta.campoFecha, consulta.rangoInicio);
  }
  if (consulta.campoFecha && consulta.rangoFin) {
    query = query.lte(consulta.campoFecha, consulta.rangoFin);
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

    try {
      // Primera llamada a OpenAI
      const respuesta = await openaiService.enviarMensaje(texto.trim(), archivosActuales);

      // Si Gemini pidió datos de BD, los ejecutamos y hacemos una segunda llamada
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
