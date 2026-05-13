import React, { useRef, KeyboardEvent, useCallback } from 'react';
import { ArrowUp, Paperclip, X, Loader2 } from 'lucide-react';

/**
 * Propiedades del componente InputMensaje
 */
interface InputMensajeProps {
  /** Callback ejecutado al enviar un texto */
  onEnviar: (texto: string) => void;
  /** Callback ejecutado al seleccionar un archivo */
  onAgregarArchivo: (file: File) => void;
  /** Callback ejecutado al eliminar un archivo adjunto */
  onEliminarArchivo: (nombre: string) => void;
  /** Lista de archivos adjuntos actuales */
  adjuntos: {
    nombre: string;
    tipo: string;
    previewUrl: string;
    tamaño: number;
  }[];
  /** Estado de carga que deshabilita interacciones */
  isLoading: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Componente para el campo de entrada del chat.
 * Maneja la captura de texto, subida de múltiples archivos (PDF, Imágenes, CSV, etc.),
 * previsualizaciones, y auto-redimensionamiento del área de texto.
 * @param props - Propiedades del input (callbacks y estado)
 * @returns Componente de la barra de entrada del chat
 */
export const InputMensaje: React.FC<InputMensajeProps> = ({
  onEnviar,
  onAgregarArchivo,
  onEliminarArchivo,
  adjuntos,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize del textarea
  const ajustarAltura = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  const handleEnviar = useCallback(() => {
    const texto = textareaRef.current?.value?.trim() || '';
    if (!texto && adjuntos.length === 0) return;
    if (isLoading) return;
    onEnviar(texto);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [adjuntos.length, isLoading, onEnviar]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => onAgregarArchivo(file));
    e.target.value = ''; // reset para permitir re-seleccionar el mismo archivo
  };

  return (
    <div className="chat-input-wrapper">

      {/* ── Barra de adjuntos ─────────────────────────────────────────────── */}
      {adjuntos.length > 0 && (
        <div className="chat-adjuntos-barra">
          {adjuntos.map(adj => (
            <div key={adj.nombre} className="chat-adjunto-chip">
              {adj.tipo.startsWith('image/') ? (
                <img src={adj.previewUrl} alt={adj.nombre} className="w-6 h-6 rounded object-cover" />
              ) : (
                <span className="text-base">
                  {adj.tipo.includes('pdf') ? '📄' : adj.tipo.includes('csv') ? '📊' : '📎'}
                </span>
              )}
              <span className="chat-adjunto-nombre">{adj.nombre}</span>
              <span className="chat-adjunto-tamaño">{formatBytes(adj.tamaño)}</span>
              <button
                onClick={() => onEliminarArchivo(adj.nombre)}
                className="chat-adjunto-eliminar"
                title="Eliminar archivo"
                aria-label={`Eliminar ${adj.nombre}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Input principal ───────────────────────────────────────────────── */}
      <div className="chat-input-container">

        {/* Botón adjuntar */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="chat-btn-adjuntar"
          title="Adjuntar archivo (imagen, PDF, CSV, TXT)"
          aria-label="Adjuntar archivo"
          id="btn-adjuntar-chat"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf,.csv,.txt,.xlsx,.doc,.docx"
          onChange={handleFileChange}
          aria-label="Selector de archivos"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-ia-input"
          rows={1}
          placeholder="Pregunta lo que quieras"
          className="chat-input-textarea"
          onInput={ajustarAltura}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Mensaje para la IA"
          autoComplete="off"
        />

        {/* Botón enviar */}
        <button
          onClick={handleEnviar}
          disabled={isLoading}
          className="chat-btn-enviar"
          title="Enviar mensaje"
          aria-label="Enviar mensaje"
          id="btn-enviar-chat"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="chat-input-footer justify-center">
        <span className="chat-input-hint">Visimap IA puede cometer errores. Considera verificar la información importante.</span>
      </div>
    </div>
  );
};
