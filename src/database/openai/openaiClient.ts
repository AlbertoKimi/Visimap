import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;

if (!apiKey) {
  console.error('[OpenAIClient] VITE_OPENAI_API_KEY no está definida en el .env');
}

// dangerouslyAllowBrowser: true es necesario para llamadas desde el navegador (Vite)
export const openaiClient = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});
