import React, { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ICONOS } from '@/constantes/iconos';
import { Card } from '@/components/ui/card';
import { useChatIA, SUGERENCIAS } from '@/hooks/useChatIA';
import { useAuthStore } from '@/stores/authStore';
import { BurbujaMensaje } from './chat/BurbujaMensaje';
import { InputMensaje } from './chat/InputMensaje';

const EstadoVacio: React.FC<{ nombre?: string }> = ({ nombre }) => (
  <div className="chat-vacio">
    <div className="mascot-container">
      <img src={ICONOS.asistente} alt="Mascota Muvi" className="mascot-img" />
      <div className="mascot-shadow" />
    </div>
    <div className="chat-vacio-textos">
      <h2 className="chat-vacio-saludo">Hola, {nombre || 'Alberto'}</h2>
      <h3 className="chat-vacio-titulo">¿Por dónde empezamos?</h3>
    </div>
  </div>
);

/**
 * Componente principal de la interfaz del Chat de IA.
 * Renderiza el contenedor completo de la conversación, la cabecera, la lista de mensajes
 * interactivos con Markdown, archivos y gráficos y la barra de sugerencias.
 * Se apoya en el hook `useChatIA` para la lógica de negocio y la conexión con OpenAI.
 * @returns Componente interactivo del chat de IA
 */
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
        <div className="flex items-center justify-center size-8 shrink-0">
          <img src={ICONOS.asistente} className="size-7 object-contain" alt="" />
        </div>
        <div className="chat-ia-header-textos">
          <h3 className="chat-ia-header-titulo">Asistente</h3>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {mensajes.length > 0 && (
            <button
              type="button"
              onClick={limpiarChat}
              className="chat-btn-limpiar"
              title="Limpiar conversación"
              aria-label="Limpiar chat"
              id="btn-limpiar-chat"
            >
              <Trash2 className="size-4" />
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
              <div className="chat-sugerencia-icono">
                <img src={s.icono} className="size-5 object-contain" alt="" />
              </div>
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
