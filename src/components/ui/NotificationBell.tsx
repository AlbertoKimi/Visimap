import React, { useState, useEffect } from 'react';
import { Bell, StickyNote, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RepositoryFactory } from '../../database/RepositoryFactory';
import { useAuthStore } from '../../stores/authStore';

interface Alerta {
  id: string;
  tipo: 'nota' | 'evento';
  mensaje: string;
  fechaDate: Date;
  fechaTexto: string;
  link: string;
  leido: boolean;
  icono: React.ElementType;
}

export const NotificationBell: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notasRepo = RepositoryFactory.getNotaRepository();
        const eventosRepo = RepositoryFactory.getEventRepository();

        const [notasArr, eventosArr] = await Promise.all([
          notasRepo.getNotasRecientes(),
          eventosRepo.getAll(),
        ]);

        const nuevasAlertas: Alerta[] = [];

        // Notas:
        notasArr.forEach(nota => {
          if (nota.creado_por === userProfile?.id) return;

          const isGlobal = !nota.asignado_a;
          const isMine = userProfile?.id === nota.asignado_a;
          const isAdmin = userProfile?.role_id === 1;
          const isCreator = userProfile?.id === nota.creado_por;

          if (!isGlobal && !isMine && !isAdmin && !isCreator) return;

          const lastUpdate = nota.actualizado_en ? new Date(nota.actualizado_en) : new Date(nota.creado_en);

          if (nota.estado === 'normal') {
            nuevasAlertas.push({
              id: `nota-${nota.id}-new`,
              tipo: 'nota',
              mensaje: `Nueva nota: ${nota.titulo}`,
              fechaDate: lastUpdate,
              fechaTexto: lastUpdate.toLocaleDateString() + ' ' + lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              link: '/dashboard/notas',
              leido: false,
              icono: StickyNote,
            });
          } else if (nota.estado === 'finalizada') {
            nuevasAlertas.push({
              id: `nota-${nota.id}-fin`,
              tipo: 'nota',
              mensaje: `Nota finalizada: ${nota.titulo}`,
              fechaDate: lastUpdate,
              fechaTexto: lastUpdate.toLocaleDateString() + ' ' + lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              link: '/dashboard/notas',
              leido: false,
              icono: CheckCircle2,
            });
          }
        });

        // Eventos:
        const hoy = new Date();
        const tresDiasAtras = new Date();
        tresDiasAtras.setDate(hoy.getDate() - 3);

        eventosArr.forEach(evento => {
          const isCreator = evento.id_usuario === userProfile?.id;

          const timestampStr = evento.created_at || (evento as any).creado_en;
          const fechaCrea = timestampStr ? new Date(timestampStr) : null;

          if (!fechaCrea) {
            console.warn('Omitiendo evento en alertas porque no tiene fecha de creación:', evento.id_evento);
            return;
          }

          const fechaFinStr = evento.fecha_fin;
          const fechaFin = fechaFinStr ? new Date(fechaFinStr) : null;

          // 1. Notificación al crear (solo si no es creador)
          if (!isCreator && fechaCrea > tresDiasAtras) {
            nuevasAlertas.push({
              id: `evt-${evento.id_evento}-nw`,
              tipo: 'evento',
              mensaje: `Nuevo evento: ${evento.nombre_evento}`,
              fechaDate: fechaCrea,
              fechaTexto: fechaCrea.toLocaleDateString() + ' ' + fechaCrea.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              link: '/dashboard/eventos',
              leido: false,
              icono: Calendar,
            });
          }

          // 2. Notificación cuando el tiempo del evento termina (para todos)
          if (fechaFin && fechaFin < hoy && fechaFin > tresDiasAtras && !evento.finalizado) {
            nuevasAlertas.push({
              id: `evt-${evento.id_evento}-end`,
              tipo: 'evento',
              mensaje: `El evento ha terminado (pendiente de confirmación): ${evento.nombre_evento}`,
              fechaDate: fechaFin,
              fechaTexto: fechaFin.toLocaleDateString() + ' ' + fechaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              link: '/dashboard/eventos',
              leido: false,
              icono: Calendar,
            });
          }

          // 3. Notificación al confirmar la finalización (para todos)
          if (evento.finalizado) {
            const timestampActualizado = (evento as any).updated_at || (evento as any).actualizado_en;
            let fechaConfirmado = timestampActualizado ? new Date(timestampActualizado) : (fechaFin && fechaFin > fechaCrea ? fechaFin : fechaCrea);

            if (fechaConfirmado > tresDiasAtras) {
              nuevasAlertas.push({
                id: `evt-${evento.id_evento}-fin`,
                tipo: 'evento',
                mensaje: `Evento confirmado como finalizado: ${evento.nombre_evento}`,
                fechaDate: fechaConfirmado,
                fechaTexto: fechaConfirmado.toLocaleDateString() + ' ' + fechaConfirmado.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                link: '/dashboard/eventos',
                leido: false,
                icono: CheckCircle2,
              });
            }
          }
        });

        nuevasAlertas.sort((a, b) => b.fechaDate.getTime() - a.fechaDate.getTime());

        const top10 = nuevasAlertas.slice(0, 10);

        const lastReadStr = localStorage.getItem(`visimap_alerts_lastread_${userProfile?.id}`);
        let unreadCount = false;

        if (lastReadStr) {
          const lastReadTime = new Date(lastReadStr).getTime();
          top10.forEach(al => {
            if (al.fechaDate.getTime() > lastReadTime) {
              al.leido = false;
              unreadCount = true;
            } else {
              al.leido = true;
            }
          });
        } else {
          if (top10.length > 0) unreadCount = true;
        }

        setAlertas(top10);
        setHasUnread(unreadCount);

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (userProfile) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [userProfile]);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState && hasUnread) {
      localStorage.setItem(`visimap_alerts_lastread_${userProfile?.id}`, new Date().toISOString());
      setHasUnread(false);
      setAlertas(prev => prev.map(a => ({ ...a, leido: true })));
    }
  };

  const handleAlertClick = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Notificaciones</h3>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                {alertas.length} Recientes
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {alertas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Bell className="text-slate-300 mb-3" size={32} />
                  <p className="text-sm font-medium text-slate-600">No hay avisos recientes</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Cuando haya nueva actividad en Notas o Eventos, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {alertas.map(alerta => {
                    const Icon = alerta.icono;
                    const isSuccess = alerta.mensaje.toLowerCase().includes('finalizad');

                    return (
                      <button
                        key={alerta.id}
                        onClick={() => handleAlertClick(alerta.link)}
                        className={`flex items-start gap-4 p-4 text-left transition-colors hover:bg-slate-50 group focus:outline-none focus:bg-slate-100 ${!alerta.leido ? 'bg-blue-50/30' : ''
                          }`}
                      >
                        <div className={`p-2.5 rounded-full shrink-0 shadow-sm ${isSuccess
                          ? 'bg-green-100 text-green-700'
                          : alerta.tipo === 'nota'
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-indigo-100 text-indigo-700'
                          }`}>
                          <Icon size={18} strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm truncate leading-tight mb-1 ${!alerta.leido ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                            }`}>
                            {alerta.mensaje}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                            {alerta.fechaTexto}
                          </p>
                        </div>

                        {!alerta.leido && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/90 shadow-sm shrink-0 mt-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {alertas.length > 0 && (
              <div className="bg-slate-50/80 p-2.5 text-center border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400">Mostrando actividad de los últimos 3 días</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
