import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;

if (!apiKey) {
  console.error('[GroqClient] VITE_GROQ_API_KEY no está definida en el .env');
}

// Groq es 100% compatible con la librería de OpenAI, solo cambiamos la URL base
export const openaiClient = new OpenAI({
  apiKey,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});
