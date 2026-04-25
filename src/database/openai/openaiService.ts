import { openaiClient } from './openaiClient';
import type { ArchivoAdjunto, GraficoGenerado, ConsultaDB, TipoGrafico } from '@/interfaces/ChatIA';

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
AGREGAR DATOS: Si te piden un gráfico temporal y la BD te da 10 registros del mismo día, DEBES SUMAR sus valores tú mismo en un único punto por día antes de generar el gráfico. NO pongas cada registro suelto.

TABLAS (Supabase - usa siempre columnas:"*" para evitar errores):
- vista_visitantes_totales (¡USA ESTA PARA CONTAR VISITANTES GENERALES!): origen(ventanilla/evento), id_origen, total_personas, fecha
- registro_visitante: id_registro, id_usuario(FK profiles), id_pais(FK pais), id_provincia(FK provincia), cantidad(int), tipo_visita(individual/familia/grupo), creado_en(TIMESTAMPTZ)
- grupo_visitante: id_grupo, id_evento(FK evento), num_visitantes, tipo_origen, origen, created_at
- evento: id_evento, nombre_evento, fecha_inicio, fecha_fin, finalizado(bool), id_tipo_evento(FK tipo_evento)
- tipo_evento: id_tipo_evento, nombre
- profiles: id(UUID), nombre, primer_apellido, rol(admin/trabajador), active(bool)
- notas: id, titulo, contenido, estado(normal/urgente/finalizada), creado_por(FK profiles), creado_en
- pais: id_pais, nombre_pais, codigo_iso
- provincia: id_provincia, nombre_provincia

CONSULTA BD:
\`\`\`db-query
{"tabla":"vista_visitantes_totales","columnas":"*","campoFecha":"fecha","rangoInicio":"${inicioMes}","rangoFin":"${fechaISO}"}
\`\`\`

GRÁFICO (ejemplo correcto sumando por fechas y usando nombres lógicos):
\`\`\`chart
{"tipo":"bar","titulo":"Visitantes Totales","datos":[{"fecha":"2026-04-01","ventanilla":45,"eventos":120}],"claveX":"fecha","claves":["ventanilla","eventos"],"colores":["#3b82f6","#10b981"]}
\`\`\`
Tipos disponibles: bar, area, pie, line.`;}

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
// Tipos del historial (formato OpenAI)
// ──────────────────────────────────────────────────────────────────────────────

// Usamos ChatCompletionMessageParam del SDK para el tipado estricto si quieres,
// o nuestro propio interfaz como teníamos en Groq
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

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
      contenidoUsuario += `[Datos de la BD — tabla: ${datosContexto.consulta.tabla}]\n${JSON.stringify(datosContexto.resultados, null, 2)}\n\n`;
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
        model: 'gpt-4o-mini', // Usamos gpt-4o-mini que es rápido y barato, perfecto para esto
        temperature: 0.5,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          // Limitar historial a los últimos 4 mensajes para no exceder el límite de tokens
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
