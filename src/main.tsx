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

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
