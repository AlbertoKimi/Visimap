/**
 * Módulo de servicio para la comunicación con la Inteligencia Artificial.
 * Se encarga de gestionar el historial de chat, construir el prompt del sistema,
 * enviar consultas a Groq/OpenAI y parsear las respuestas especiales (gráficos y queries DB).
 * @module
 */

import { openaiClient } from './openaiClient';
import type { ArchivoAdjunto, GraficoGenerado, ConsultaDB, TipoGrafico } from '@/interfaces/ChatIA';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

// ──────────────────────────────────────────────────────────────────────────────
// System Prompt — Contexto completo del museo y su base de datos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Construye dinámicamente el prompt del sistema que define el comportamiento de la IA.
 * Le proporciona el esquema exacto de la base de datos y la fecha actual para que
 * sepa cómo formular consultas SQL (Supabase) al vuelo.
 */
function buildSystemPrompt(): string {
  const ahora = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fechaISO = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  const inicioMes = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-01`;
  const inicioAnio = `${ahora.getFullYear()}-01-01`;

  return `Analista de Visimap. Usa la DB como única fuente.
REGLAS:
1. Si necesitas datos, genera ÚNICAMENTE el bloque \`\`\`db-query.
2. Tras recibir datos:
   - Da la respuesta final (periodo/origen).
   - Para EVOLUCIONES (días, semanas, meses) usa SIEMPRE \`\`\`chart tipo "area". Es el preferido del usuario.
   - Para desgloses (provincias, países) usa "bar" o "pie".
3. Precisión total. No menciones nombres técnicos.

EJEMPLO QUERY (Provincias):
\`\`\`db-query {"tabla":"registro_visitante", "columnas":"cantidad, provincia(nombre_provincia)"} \`\`\`

EJEMPLO CHART (Evolución):
\`\`\`chart
{"tipo":"area","titulo":"Visitantes Mensuales","datos":[{"fecha":"2026-05-01","total":30}],"claveX":"fecha","claves":["total"]}
\`\`\`

ESQUEMA:
- vista_visitas_agrupadas_diarias: [fecha, total_visitantes].
- registro_visitante: [cantidad, id_provincia, id_pais, creado_en].
- provincia: [id_provincia, nombre_provincia].
- pais: [id_pais, nombre_pais].
- evento: [nombre_evento, fecha_inicio, fecha_fin].

CONTEXTO:
- Hoy: ${fechaISO}
- Mes: ${inicioMes} a ${fechaISO}
- Año: ${inicioAnio} a ${fechaISO}`;
}

const getSystemPrompt = buildSystemPrompt;

// ──────────────────────────────────────────────────────────────────────────────
// Parser de bloques especiales en la respuesta
// ──────────────────────────────────────────────────────────────────────────────

/** Resultado de parsear la respuesta bruta de la IA */
export interface RespuestaParsed {
  /** Texto limpio para mostrar al usuario, sin los bloques JSON ocultos */
  texto: string;
  /** Arrays de configuraciones de gráficos extraídos del markdown */
  graficos: GraficoGenerado[];
  /** Arrays de consultas a base de datos sugeridas por la IA */
  consultas: ConsultaDB[];
}

/**
 * Examina la respuesta en texto plano devuelta por la IA usando expresiones regulares.
 * Extrae los bloques ````chart```` y ````db-query````, convirtiéndolos en objetos TS,
 * y devuelve el texto sobrante limpio de metadatos.
 */
function parsearRespuesta(texto: string): RespuestaParsed {
  const graficos: GraficoGenerado[] = [];
  const consultas: ConsultaDB[] = [];

  const regexChart = /```chart\s*([\s\S]*?)```/g;
  let textoLimpio = texto;
  let match;

  while ((match = regexChart.exec(texto)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      graficos.push({
        id: `grafico-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        tipo: (json.tipo as TipoGrafico) || 'bar',
        titulo: json.titulo || 'Gráfico',
        subtitulo: json.subtitulo,
        datos: json.datos || [],
        claves: json.claves || [],
        claveX: json.claveX || 'name',
        colores: json.colores || ['#3b82f6', '#9333ea', '#10b981', '#f97316'],
      });
      textoLimpio = textoLimpio.replace(match[0], '');
    } catch (e) {
      console.warn('[OpenAIService] Error parseando bloque chart:', e);
    }
  }

  const regexQuery = /```db-query\s*([\s\S]*?)```/g;
  while ((match = regexQuery.exec(texto)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      consultas.push(json as ConsultaDB);
      textoLimpio = textoLimpio.replace(match[0], '');
    } catch (e) {
      console.warn('[OpenAIService] Error parseando bloque db-query:', e);
    }
  }

  return { texto: textoLimpio.trim(), graficos, consultas };
}

// ──────────────────────────────────────────────────────────────────────────────
// Servicio principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Servicio Singleton que orquesta la mensajería con la API del LLM.
 * Mantiene la memoria del historial a corto plazo del chat activo.
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private historial: ChatCompletionMessageParam[] = [];

  private constructor() { }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /** Reinicia el historial de mensajes de la sesión activa */
  limpiarHistorial(): void {
    this.historial = [];
  }

  /**
   * Envía un mensaje al LLM, incluyendo historial, archivos adjuntos procesados 
   * y datos de contexto inyectados por peticiones a la DB previas.
   */
  async enviarMensaje(
    textoPregunta: string,
    archivos: ArchivoAdjunto[] = [],
    datosContexto?: { consulta: ConsultaDB; resultados: unknown[] }
  ): Promise<RespuestaParsed> {
    let contenidoUsuario = '';

    if (datosContexto) {
      const dataStr = JSON.stringify(datosContexto.resultados);
      const safetyLimit = 20000;

      if (dataStr.length > safetyLimit) {
        const truncatedData = (datosContexto.resultados as any[]).slice(0, 150);
        contenidoUsuario += `[DATOS - Tabla: ${datosContexto.consulta.tabla} (Muestra de 150 filas)]\n${JSON.stringify(truncatedData)}\n\n`;
      } else {
        contenidoUsuario += `[DATOS - Tabla: ${datosContexto.consulta.tabla}]\n${dataStr}\n\n`;
      }
    }

    contenidoUsuario += textoPregunta;

    for (const archivo of archivos) {
      if (archivo.tipo.startsWith('text/') || archivo.tipo.includes('csv')) {
        try {
          const textoArchivo = atob(archivo.base64);
          contenidoUsuario += `\n\n[Archivo: ${archivo.nombre}]\n${textoArchivo.slice(0, 8000)}`;
        } catch {
          contenidoUsuario += `\n\n[Archivo: ${archivo.nombre} — error]`;
        }
      } else {
        contenidoUsuario += `\n\n[Archivo: ${archivo.nombre} (${archivo.tipo})]`;
      }
    }

    const mensajeUsuario: ChatCompletionMessageParam = { role: 'user', content: contenidoUsuario };
    this.historial.push(mensajeUsuario);

    try {
      const completion = await openaiClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          ...this.historial.slice(-6),
        ],
      });

      const textoRespuesta = completion.choices[0]?.message?.content ?? '';
      this.historial.push({ role: 'assistant', content: textoRespuesta });
      return parsearRespuesta(textoRespuesta);
    } catch (error) {
      this.historial.pop();
      throw error;
    }
  }
}

export const openaiService = OpenAIService.getInstance();
