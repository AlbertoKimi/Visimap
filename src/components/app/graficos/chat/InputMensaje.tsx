import React, { useRef, KeyboardEvent, useCallback } from 'react';
import { Send, Paperclip, X, Loader2, Sparkles } from 'lucide-react';

interface InputMensajeProps {
  onEnviar: (texto: string) => void;
  onAgregarArchivo: (file: File) => void;
  onEliminarArchivo: (nombre: string) => void;
  adjuntos: {
    nombre: string;
    tipo: string;
    previewUrl: string;
    tamaño: number;
  }[];
  isLoading: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
          placeholder="Escribe tu pregunta... (Shift+Enter para nueva línea)"
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
          title="Enviar mensaje (Enter)"
          aria-label="Enviar mensaje"
          id="btn-enviar-chat"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Badge modelo ──────────────────────────────────────────────────── */}
      <div className="chat-input-footer">
        <span className="chat-modelo-badge">
          <Sparkles className="w-3 h-3" />
          GPT-4o-mini · OpenAI
        </span>
        <span className="chat-input-hint">Enter para enviar · Shift+Enter para nueva línea</span>
      </div>
    </div>
  );
};
