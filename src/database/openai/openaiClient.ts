/**
 * Módulo de inicialización del cliente de IA.
 * Utiliza el SDK de OpenAI pero configurado para conectarse a la API de Groq.
 * @module
 */
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;

if (!apiKey) {
  console.error('[GroqClient] VITE_GROQ_API_KEY no está definida en el .env');
}

/**
 * Cliente de IA exportado para ser usado en el servicio.
 * Groq es 100% compatible con la librería de OpenAI, solo cambiamos la URL base.
 * Se habilita `dangerouslyAllowBrowser` para permitir llamadas desde el frontend.
 */
export const openaiClient = new OpenAI({
  apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});
