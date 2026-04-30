import React, { useState } from 'react';
import { Check, Clock, Trash2 } from 'lucide-react';
import { Nota } from "@/interfaces/Nota";
import { useAuthStore } from "@/stores/authStore";
import { RepositoryFactory } from "@/database/RepositoryFactory";

interface NotaCardProps {
  nota: Nota;
  onNotaUpdated: () => void;
}

export const NotaCard: React.FC<NotaCardProps> = ({ nota, onNotaUpdated }) => {
  const { userProfile } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = userProfile?.role_id === 1;
  const isCreator = userProfile?.id === nota.creado_por;
  const isGlobal = !nota.asignado_a;
  const isTarget = userProfile?.id === nota.asignado_a;

  // Lógica de permisos de botones
  const hasDeletePermission = isAdmin || isCreator;
  const hasTogglePermission = isAdmin || isGlobal || isTarget;

  const handleSetEstado = async (nuevoEstado: 'normal' | 'pendiente' | 'finalizada') => {
    if (nota.estado === nuevoEstado || !hasTogglePermission) return;
    setIsProcessing(true);
    try {
      const repo = RepositoryFactory.getNotaRepository();
      await repo.updateNota(nota.id, { estado: nuevoEstado });
      onNotaUpdated();
    } catch (error) {
      console.error('Error al actualizar nota', error);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!hasDeletePermission) return;
    setIsProcessing(true);
    try {
      const repo = RepositoryFactory.getNotaRepository();
      await repo.deleteNota(nota.id);
      onNotaUpdated();
    } catch (error) {
      console.error('Error al borrar nota', error);
      setIsProcessing(false);
    }
  };

  const formattedDate = new Date(nota.creado_en).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const autorBase = nota.creador;
  const autorNombre = autorBase
    ? `${autorBase.nombre} ${autorBase.primer_apellido}`
    : 'Usuario Desconocido';

  const asignadoTexto = nota.asignado_a && nota.asignado
    ? `Para: ${nota.asignado.nombre}`
    : `Para: Todos`;

  const getColorClasses = () => {
    switch (nota.estado) {
      case 'normal':
        return 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 border-blue-200/50 dark:border-blue-800/50';
      case 'pendiente':
        return 'bg-orange-100 dark:bg-orange-900/40 hover:bg-orange-200 dark:hover:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/50';
      case 'finalizada':
        return 'bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 border-green-200/50 dark:border-green-800/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50';
    }
  };

  return (
    <div className={`p-5 rounded-sm shadow-md border flex flex-col h-full transition-all duration-300 relative overflow-hidden ${getColorClasses()}`}>
      {/* Parte superior de la nota*/}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-white/40 dark:bg-slate-700/40 shadow-sm rounded-b-md"></div>

      <div className="flex justify-between items-start mb-2 gap-2 mt-2">
        <div className="flex flex-col gap-1 max-w-[70%]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 px-1.5 py-0.5 rounded w-fit">
            {asignadoTexto}
          </span>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 break-words leading-tight">
            {nota.titulo}
          </h3>
        </div>

        <div className="flex gap-1 shrink-0 bg-white/50 dark:bg-slate-800/50 rounded-lg p-1 items-center">

          {/* Botón Pendiente: Solo visible si está normal y tiene permiso */}
          {nota.estado === 'normal' && hasTogglePermission && (
            <button
              onClick={() => handleSetEstado('pendiente')}
              disabled={isProcessing}
              className="p-1.5 rounded-md transition-colors tooltip bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-100 hover:bg-orange-300 dark:hover:bg-orange-800 font-medium scale-105"
              title="Mover a Pendiente"
            >
              <Clock size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Botón Finalizar: Visible si está normal o pendiente y tiene permiso */}
          {(nota.estado === 'normal' || nota.estado === 'pendiente') && hasTogglePermission && (
            <button
              onClick={() => handleSetEstado('finalizada')}
              disabled={isProcessing}
              className="p-1.5 rounded-md transition-colors tooltip bg-green-300 dark:bg-green-900 text-green-900 dark:text-green-100 hover:bg-green-400 dark:hover:bg-green-800 font-medium scale-105"
              title="Marcar como Finalizada"
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Botón Eliminar: Visible siempre si tiene permisos */}
          {hasDeletePermission && (
            <>
              {(nota.estado === 'normal' || nota.estado === 'pendiente') && hasTogglePermission && (
                <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1"></div>
              )}
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="p-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                title="Borrar Nota"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow text-sm mb-4 mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {nota.contenido}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-auto pt-3 border-t border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          {autorBase?.avatar_url ? (
            <img src={autorBase.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover shadow-sm border border-white/50 dark:border-slate-700" />
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
              {autorBase?.nombre?.charAt(0) || '?'}
            </div>
          )}
          <span className="truncate max-w-[100px] font-semibold">{autorNombre}</span>
        </div>
        <span className="font-medium opacity-80">{formattedDate}</span>
      </div>
    </div>
  );
};
