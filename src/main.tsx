/**
 * Punto de entrada principal de la aplicación React (Bootstrapping).
 * Monta el componente raíz `App` en el DOM dentro del elemento `#root` de `index.html`.
 * Importa los estilos globales de TailwindCSS (`index.css`).
 * @module
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from "@/App"

// Tras un nuevo deploy, los chunks lazy con hash antiguo dejan de existir en el CDN.
// El navegador (sobre todo Safari iOS con BFCache) puede intentar pedirlos y recibe
// el index.html del fallback SPA → error "is not a valid JavaScript MIME type".
// Detectamos ese caso y recargamos UNA vez por sesión para evitar bucles.
const RELOAD_FLAG = 'visimap-stale-chunk-reload';

const isStaleChunkError = (message: string) =>
  message.includes('Failed to fetch dynamically imported module') ||
  message.includes('Importing a module script failed') ||
  message.includes('not a valid JavaScript MIME type') ||
  message.includes('Loading chunk') ||
  message.includes('Loading CSS chunk');

const reloadIfStaleChunk = (message: string) => {
  if (!isStaleChunkError(message)) return;
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
};

window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
});

window.addEventListener('error', (event) => {
  reloadIfStaleChunk(event.message || event.error?.message || '');
});

window.addEventListener('unhandledrejection', (event) => {
  reloadIfStaleChunk(event.reason?.message || String(event.reason || ''));
});

window.addEventListener('load', () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5000);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
