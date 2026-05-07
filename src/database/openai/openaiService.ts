import { openaiClient } from './openaiClient';
import type { ArchivoAdjunto, GraficoGenerado, ConsultaDB, TipoGrafico } from '@/interfaces/ChatIA';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

// ──────────────────────────────────────────────────────────────────────────────
// System Prompt — Contexto completo del museo y su base de datos
// ──────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const ahora = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fechaISO   = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  const inicioMes  = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-01`;
  const inicioAnio = `${ahora.getFullYear()}-01-01`;

  return `Eres Visimap IA, asistente del sistema de gestión de un museo. Responde siempre en español con markdown.
Fecha actual: ${fechaISO}. "Este mes"=${inicioMes}~${fechaISO}. "Este año"=${inicioAnio}~${fechaISO}.

REGLA ABSOLUTA: NUNCA inventes datos. Si la BD devuelve [] (vacío), di que no hay datos y NO generes gráfico.
NUNCA imprimas bloques de código JSON con los datos en crudo para el usuario.
AGREGAR DATOS: Si te piden un gráfico temporal y la BD te da múltiples registros del mismo día, DEBES SUMAR sus valores tú mismo en un único punto por día antes de generar el gráfico. NO pongas cada registro suelto.
TOTALES EXACTOS Y GRÁFICOS: 
1. Si el usuario pide un dato exacto (ej. "cuántos visitantes", "dame el total de registros"), DEBES sumar los datos de la consulta y responder SOLO con texto dando la cifra exacta. NO generes ningún bloque de gráfico a menos que el usuario lo pida.
2. SOLO genera un bloque \`\`\`chart si el usuario pide explícitamente un gráfico, gráfica, evolución visual o representación visual. Si no lo pide, da solo el dato en texto.
RESUMEN OBLIGATORIO: Nunca enumeres todos los días uno por uno (ej. "el día 1 hubo X, el día 2 hubo Y"). Haz un resumen directo. Si te piden datos de todo un AÑO, agrupa la información por MESES para los cálculos y gráficos.

TABLAS (Supabase - usa siempre columnas:"*" para evitar errores):
- vista_visitas_agrupadas_diarias (¡ÚSALA PARA TOTAL DE VISITANTES, REGISTROS Y RENDIMIENTO DEL PERSONAL!): fecha, tipo_entrada, nombre_trabajador, total_visitantes, total_registros
- vista_visitas_unificadas (¡ÚSALA SOLO SI NECESITAS FILTRAR POR PAÍS, PROVINCIA O PROCEDENCIA!): tipo_entrada, fecha, total_personas, tipo_origen(provincia/pais), procedencia, nombre_trabajador
- evento: id_evento, nombre_evento, fecha_inicio, fecha_fin, finalizado(bool), id_tipo_evento(FK tipo_evento)
- tipo_evento: id_tipo_evento, nombre
- perfiles (profiles): id(UUID), nombre, primer_apellido, rol(admin/trabajador), active(bool)
- notas: id, titulo, contenido, estado(normal/urgente/finalizada), creado_por(FK profiles), creado_en

CONSULTA BD:
\`\`\`db-query
{"tabla":"vista_visitas_agrupadas_diarias","columnas":"*","campoFecha":"fecha","rangoInicio":"${inicioMes}","rangoFin":"${fechaISO}"}
\`\`\`

GRÁFICO (ejemplo correcto sumando por fechas y usando nombres lógicos):
\`\`\`chart
{"tipo":"bar","titulo":"Visitantes Totales","datos":[{"fecha":"2026-04-01","ventanilla":45,"eventos":120}],"claveX":"fecha","claves":["ventanilla","eventos"],"colores":["#3b82f6","#10b981"]}
\`\`\`
Tipos disponibles: bar, area, pie, line.`;
}

const getSystemPrompt = buildSystemPrompt;

// ──────────────────────────────────────────────────────────────────────────────
// Parser de bloques especiales en la respuesta
// ──────────────────────────────────────────────────────────────────────────────

export interface RespuestaParsed {
  texto: string;
  graficos: GraficoGenerado[];
  consultas: ConsultaDB[];
}

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

export class OpenAIService {
  private static instance: OpenAIService;
  private historial: ChatCompletionMessageParam[] = [];

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  limpiarHistorial(): void {
    this.historial = [];
  }

  async enviarMensaje(
    textoPregunta: string,
    archivos: ArchivoAdjunto[] = [],
    datosContexto?: { consulta: ConsultaDB; resultados: unknown[] }
  ): Promise<RespuestaParsed> {
    let contenidoUsuario = '';

    if (datosContexto) {
      contenidoUsuario += `[Datos de la BD — tabla: ${datosContexto.consulta.tabla}]\n${JSON.stringify(datosContexto.resultados)}\n\n`;
    }

    contenidoUsuario += textoPregunta;

    for (const archivo of archivos) {
      if (archivo.tipo.startsWith('text/') || archivo.tipo.includes('csv')) {
        try {
          const textoArchivo = atob(archivo.base64);
          contenidoUsuario += `\n\n[Archivo adjunto: ${archivo.nombre}]\n${textoArchivo.slice(0, 8000)}`;
        } catch {
          contenidoUsuario += `\n\n[Archivo adjunto: ${archivo.nombre} — no se pudo decodificar]`;
        }
      } else {
        contenidoUsuario += `\n\n[Archivo adjunto: ${archivo.nombre} (${archivo.tipo})]`;
      }
    }

    const mensajeUsuario: ChatCompletionMessageParam = { role: 'user', content: contenidoUsuario };
    this.historial.push(mensajeUsuario);

    try {
      const completion = await openaiClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          ...this.historial.slice(-4),
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
