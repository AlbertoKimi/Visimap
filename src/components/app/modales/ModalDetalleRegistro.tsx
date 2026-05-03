import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ModalDetalleRegistroProps } from '@/interfaces/components';
import { MapPin, Users, Calendar, MessageSquare, Globe, Info, Loader2 } from 'lucide-react';
import { RepositoryFactory } from '@/database/RepositoryFactory';
import { GrupoVisitante } from '@/interfaces/Evento';
import { formatearFecha, cn } from '@/utils/utils';

const eventRepo = RepositoryFactory.getEventRepository();

export const ModalDetalleRegistro: React.FC<ModalDetalleRegistroProps> = ({
  isOpen,
  onClose,
  data,
  tipo
}) => {
  const [grupos, setGrupos] = useState<GrupoVisitante[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && (tipo === 'evento' || tipo === 'eventos') && data?.id_evento) {
      const fetchGrupos = async () => {
        setLoading(true);
        try {
          const res = await eventRepo.getGruposByEvento(data.id_evento);
          setGrupos(res);
        } catch (error) {
          console.error("Error fetching event groups:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGrupos();
    }
  }, [isOpen, tipo, data]);

  if (!data) return null;

  const isMapa = tipo === 'mapa';
  const title = isMapa ? 'Detalles del Registro' : 'Detalles del Evento';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span>{title}</span>
        </div>
      }
      size="md"
    >
      <div className="space-y-6">
        {/* Información */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              {isMapa ? <MapPin className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isMapa ? 'Provincia / Procedencia' : 'Nombre del Evento'}
              </p>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                {isMapa ? (data.provincia?.nombre_provincia || data.pais?.nombre_pais || '—') : data.nombre_evento}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Visitantes
              </p>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-lg">{isMapa ? data.cantidad : data.total_visitantes || grupos.reduce((acc, g) => acc + g.num_visitantes, 0)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Tipo
              </p>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                {isMapa ? (
                  <>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      data.tipo_visita === 'individual'
                        ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        : "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                    )}>
                      {data.tipo_visita === 'individual' ? 'Individual' : 'Grupo'}
                    </span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="font-medium capitalize">{data.tipo_evento?.nombre || 'Evento'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Evento de grupo */}
        {!isMapa && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Desglose de Subgrupos
            </p>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-2">
                {grupos.length > 0 ? grupos.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        g.tipo_origen === 'provincia' ? "bg-blue-500" : "bg-purple-500"
                      )} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{g.origen}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{g.num_visitantes} pers.</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic text-center p-4">No hay subgrupos registrados.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mensaje */}
        {(isMapa ? data.observaciones : (data.evento?.descripcion || data.descripcion)) && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              {isMapa ? 'Observaciones' : 'Descripción'}
            </p>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 relative group">
              <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-slate-200 dark:text-slate-700 group-hover:text-blue-500/20 transition-colors" />
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {isMapa ? data.observaciones : (data.evento?.descripcion || data.descripcion)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2 border-t border-slate-50 dark:border-slate-800">
          <span>Registrado por: {data.perfil?.nombre || data.perfil?.nombre_usuario || 'Sistema'}</span>
          <span>{formatearFecha(data.creado_en || data.created_at)}</span>
        </div>
      </div>
    </Modal>
  );
};

