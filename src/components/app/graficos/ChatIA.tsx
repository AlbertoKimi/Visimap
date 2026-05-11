import React, { useEffect } from 'react';
import { BotMessageSquare, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useChatIA, SUGERENCIAS } from '@/hooks/useChatIA';
import { useAuthStore } from '@/stores/authStore';
import { BurbujaMensaje } from './chat/BurbujaMensaje';
import { InputMensaje } from './chat/InputMensaje';

const EstadoVacio: React.FC<{ nombre?: string }> = ({ nombre }) => (
  <div className="chat-vacio">
    <div className="chat-vacio-textos">
      <h2 className="chat-vacio-saludo">Hola, {nombre || 'Alberto'}</h2>
      <h3 className="chat-vacio-titulo">¿Por dónde empezamos?</h3>
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
  const { userProfile } = useAuthStore();


  useEffect(() => {
    ultimoMensajeRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, []);

  return (
    <div className="chat-ia-wrapper" id="chat-ia">

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="chat-ia-header">
        <div className="chat-ia-header-icono">
          <BotMessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="chat-ia-header-textos">
          <h3 className="chat-ia-header-titulo">Asistente</h3>
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
        </div>
      </div>

      {/* ── Área de mensajes ──────────────────────────────────────────────── */}
      <div className="chat-mensajes-area no-scrollbar" id="chat-mensajes-area">
        {mensajes.length === 0 ? (
          <EstadoVacio nombre={userProfile?.nombre} />
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
        {/* Fila de sugerencias siempre visible */}
        <div className="chat-sugerencias-fila no-scrollbar">
          {SUGERENCIAS.map(s => (
            <Card
              key={s.etiqueta}
              className="chat-sugerencia-pill"
              onClick={() => enviarMensaje(s.prompt)}
            >
              <span className="chat-sugerencia-icono">{s.icono}</span>
              <span className="chat-sugerencia-texto">{s.etiqueta}</span>
            </Card>
          ))}
        </div>

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
