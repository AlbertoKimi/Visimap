/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // añadir otras variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
