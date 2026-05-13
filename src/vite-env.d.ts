/// <reference types="vite/client" />

// Declaraciones de módulos para archivos de vídeo
declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // añadir otras variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
