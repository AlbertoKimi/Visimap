import React, { useEffect } from 'react';
import { BotMessageSquare, Sparkles, Trash2 } from 'lucide-react';
import { useChatIA, SUGERENCIAS } from '@/hooks/useChatIA';
import { BurbujaMensaje } from './chat/BurbujaMensaje';
import { InputMensaje } from './chat/InputMensaje';

// Pantalla de bienvenida con sugerencias


interface EstadoVacioProps {
  onSugerencia: (prompt: string) => void;
}

const EstadoVacio: React.FC<EstadoVacioProps> = ({ onSugerencia }) => (
  <div className="chat-vacio">
    <div className="chat-vacio-avatar">
      <BotMessageSquare className="w-10 h-10 text-white" />
    </div>
    <div className="chat-vacio-textos">
      <h3 className="chat-vacio-titulo">¿En qué puedo ayudarte hoy?</h3>
      <p className="chat-vacio-subtitulo">
        Puedo analizar datos del museo, generar gráficos, crear informes y responder cualquier pregunta.
      </p>
    </div>
    <div className="chat-sugerencias-grid">
      {SUGERENCIAS.map(s => (
        <button
          key={s.etiqueta}
          className="chat-sugerencia"
          onClick={() => onSugerencia(s.prompt)}
          id={`sugerencia-${s.etiqueta.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="chat-sugerencia-icono">{s.icono}</span>
          <span className="chat-sugerencia-texto">{s.etiqueta}</span>
        </button>
      ))}
    </div>
  </div>
);

// ChatIA — componente principal

export const ChatIA: React.FC = () => {
  const {
    mensajes,
    adjuntos,
    isLoading,
    ultimoMensajeRef,
    enviarMensaje,
    agregarArchivo,
    eliminarArchivo,
    limpiarChat,
  } = useChatIA();


  useEffect(() => {
    ultimoMensajeRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, []);

  return (
    <div className="chat-ia-wrapper" id="chat-ia">

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="chat-ia-header">
        <div className="chat-ia-header-icono">
          <BotMessageSquare className="w-5 h-5 text-white" />
        </div>
        <div className="chat-ia-header-textos">
          <h3 className="chat-ia-header-titulo">Análisis con Inteligencia Artificial</h3>
          <p className="chat-ia-header-subtitulo">Consulta datos, genera gráficos y crea informes en lenguaje natural</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {mensajes.length > 0 && (
            <button
              onClick={limpiarChat}
              className="chat-btn-limpiar"
              title="Limpiar conversación"
              aria-label="Limpiar chat"
              id="btn-limpiar-chat"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* ── Área de mensajes ──────────────────────────────────────────────── */}
      <div className="chat-mensajes-area custom-scrollbar" id="chat-mensajes-area">
        {mensajes.length === 0 ? (
          <EstadoVacio onSugerencia={enviarMensaje} />
        ) : (
          <div className="chat-mensajes-lista">
            {mensajes.map(m => (
              <BurbujaMensaje key={m.id} mensaje={m} />
            ))}

            <div ref={ultimoMensajeRef} style={{ height: 1 }} />
          </div>
        )}
      </div>

      {/* ── Input inferior ────────────────────────────────────────────────── */}
      <div className="chat-ia-footer">
        <InputMensaje
          onEnviar={enviarMensaje}
          onAgregarArchivo={agregarArchivo}
          onEliminarArchivo={eliminarArchivo}
          adjuntos={adjuntos}
          isLoading={isLoading}
        />
      </div>

    </div>
  );
};
