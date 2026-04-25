import React, { useMemo } from 'react';
import { Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { GraficoMensaje } from './GraficoMensaje';
import type { MensajeChat } from '@/interfaces/ChatIA';

// ──────────────────────────────────────────────────────────────────────────────
// Renderizador de Markdown ligero (negritas, cursivas, código, listas, headers)
// ──────────────────────────────────────────────────────────────────────────────

function renderMarkdown(texto: string): string {
  return texto
    // Encabezados
    .replace(/^### (.+)$/gm, '<h4 class="chat-md-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="chat-md-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="chat-md-h2">$1</h2>')
    // Negritas e itálicas
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Código inline
    .replace(/`([^`]+)`/g, '<code class="chat-md-code">$1</code>')
    // Listas con guión
    .replace(/^- (.+)$/gm, '<li class="chat-md-li">$1</li>')
    // Listas numeradas
    .replace(/^\d+\. (.+)$/gm, '<li class="chat-md-li">$1</li>')
    // Líneas horizontales
    .replace(/^---$/gm, '<hr class="chat-md-hr" />')
    // Saltos de línea
    .replace(/\n\n/g, '</p><p class="chat-md-p">')
    .replace(/\n/g, '<br />');
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente de miniatura de archivo adjunto
// ──────────────────────────────────────────────────────────────────────────────

const MiniaturasArchivos: React.FC<{ archivos: NonNullable<MensajeChat['archivos']> }> = ({ archivos }) => (
  <div className="chat-archivos-grid">
    {archivos.map((archivo) => (
      <div key={archivo.nombre} className="chat-archivo-chip" title={archivo.nombre}>
        {archivo.tipo.startsWith('image/') ? (
          <img src={archivo.previewUrl} alt={archivo.nombre} className="chat-archivo-img" />
        ) : (
          <div className="chat-archivo-icono">
            <span className="text-lg">
              {archivo.tipo.includes('pdf') ? '📄' : archivo.tipo.includes('csv') ? '📊' : '📎'}
            </span>
            <span className="chat-archivo-nombre">{archivo.nombre}</span>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Dots de carga animados
// ──────────────────────────────────────────────────────────────────────────────

const TypingDots: React.FC = () => (
  <div className="chat-typing-dots">
    <span className="chat-typing-dot" style={{ animationDelay: '0ms' }} />
    <span className="chat-typing-dot" style={{ animationDelay: '160ms' }} />
    <span className="chat-typing-dot" style={{ animationDelay: '320ms' }} />
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Burbuja de mensaje
// ──────────────────────────────────────────────────────────────────────────────

interface BurbujaMensajeProps {
  mensaje: MensajeChat;
}

export const BurbujaMensaje: React.FC<BurbujaMensajeProps> = ({ mensaje }) => {
  const esUsuario = mensaje.rol === 'user';
  const hora = mensaje.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const htmlTexto = useMemo(
    () => (mensaje.texto ? renderMarkdown(mensaje.texto) : ''),
    [mensaje.texto]
  );

  return (
    <div className={`chat-burbuja-fila ${esUsuario ? 'chat-burbuja-fila--user' : 'chat-burbuja-fila--model'}`}>
      {/* Avatar */}
      {!esUsuario && (
        <div className="chat-avatar chat-avatar--model">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`chat-burbuja-contenido ${esUsuario ? 'items-end' : 'items-start'}`}>
        {/* Burbuja */}
        <div
          className={`chat-burbuja ${
            esUsuario ? 'chat-burbuja--user' : 'chat-burbuja--model'
          } ${mensaje.error ? 'chat-burbuja--error' : ''}`}
        >
          {/* Estado de carga */}
          {mensaje.cargando ? (
            <TypingDots />
          ) : (
            <>
              {/* Archivos adjuntos del usuario */}
              {mensaje.archivos && mensaje.archivos.length > 0 && (
                <MiniaturasArchivos archivos={mensaje.archivos} />
              )}

              {/* Texto con icono de error si aplica */}
              {mensaje.error && (
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                </div>
              )}

              {/* Texto renderizado en markdown */}
              {mensaje.texto && (
                <div
                  className="chat-burbuja-texto"
                  dangerouslySetInnerHTML={{ __html: `<p class="chat-md-p">${htmlTexto}</p>` }}
                />
              )}
            </>
          )}
        </div>

        {/* Gráficos incrustados (debajo de la burbuja) */}
        {mensaje.graficos && mensaje.graficos.length > 0 && (
          <div className="chat-graficos-lista">
            {mensaje.graficos.map(grafico => (
              <GraficoMensaje key={grafico.id} grafico={grafico} />
            ))}
          </div>
        )}

        {/* Hora */}
        <span className="chat-burbuja-hora">{hora}</span>
      </div>

      {/* Avatar usuario */}
      {esUsuario && (
        <div className="chat-avatar chat-avatar--user">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
