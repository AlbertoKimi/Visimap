import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Snackbar, Alert, Button } from '@mui/material';
import { EventModal } from "@/components/app/modales/EventModal";
import { Calendario } from "@/components/app/Calendario";
import { obtenerColor } from "@/constantes/appConstants";
import { formatearFechaInput } from "@/utils/utils";
import { Button as CustomButton } from "@/components/ui/button";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { TipoEvento, Evento } from "@/interfaces/Evento";
import { useAuthStore } from "@/stores/authStore";
import { useCallback } from 'react';

const eventRepo = RepositoryFactory.getEventRepository();
const typeRepo = RepositoryFactory.getEventTypeRepository();

export const VistaCalendario: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [eventos, setEventos] = useState<any[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState<{ mode: 'view' | 'new', event: Partial<Evento> & { confirmarAlAbrir?: boolean } } | null>(null);
  const [ahora, setAhora] = useState(new Date());
  const [notificacion, setNotificacion] = useState<{
    open: boolean,
    mensaje: string,
    tipo: 'success' | 'error' | 'info' | 'warning',
    action?: React.ReactNode
  }>({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  useEffect(() => {
    const temporizador = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(temporizador);
  }, []);

  const eventosPendientes = React.useMemo(() => {
    return eventos.filter(ev => {
      const end = new Date(ev.end || ev.start);
      return !ev.extendedProps?.finalizado && end < ahora;
    });
  }, [eventos, ahora]);

  useEffect(() => {
    if (eventosPendientes.length > 0) {
      const msg = eventosPendientes.length === 1
        ? `El evento "${eventosPendientes[0].title}" ha terminado.`
        : `Tienes ${eventosPendientes.length} eventos pendientes de finalizar.`;

      setNotificacion({
        open: true,
        mensaje: msg,
        tipo: 'warning',
        action: (
          <Button color="inherit" size="small" onClick={() => handleAbrirModalEvento(eventosPendientes[0], true)}>
            VER
          </Button>
        )
      });
    }
  }, [eventosPendientes.length]);

  const fetchInitialData = useCallback(async () => {
    try {
      setCargando(true);
      const [typesData, eventsData] = await Promise.all([
        typeRepo.getAll(),
        eventRepo.getAll()
      ]);
      setTiposEvento(typesData);

      const mappedEvents = eventsData.map(ev => {
        const nombreTipo = ev.tipo_evento?.nombre || '';
        const color = obtenerColor(nombreTipo);
        return {
          id: String(ev.id_evento),
          title: ev.nombre_evento,
          start: ev.fecha_inicio,
          end: ev.fecha_fin,
          backgroundColor: color.bg,
          textColor: color.text,
          borderColor: color.border,
          extendedProps: {
            id_tipo: ev.id_tipo,
            nombreTipo,
            descripcion: ev.descripcion || '',
            id_evento: ev.id_evento,
            finalizado: ev.finalizado || false,
          },
          editable: !ev.finalizado,
        };
      });
      setEventos(mappedEvents);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      mostrarNotificacion('Error al cargar datos: ' + message, 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning' = 'success', action?: React.ReactNode) => {
    setNotificacion({ open: true, mensaje, tipo, action });
  };

  const handleCerrarNotificacion = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotificacion(n => ({ ...n, open: false }));
  };

  const handleAbrirModalEvento = (e: any, confirmar = false) => {
    // Usamos any temporalmente para las props de FullCalendar/MappedEvents 
    // y evitar duplicaciones complejas de tipos en esta vista.
    const props = e.extendedProps || e;
    setModal({
      mode: 'view',
      event: {
        id_evento: props.id_evento,
        nombre_evento: e.title || props.nombre_evento,
        id_tipo: props.id_tipo,
        descripcion: props.descripcion,
        fecha_inicio: formatearFechaInput(e.start || props.fecha_inicio),
        fecha_fin: formatearFechaInput(e.end || props.fecha_fin || e.start),
        finalizado: props.finalizado || false,
        confirmarAlAbrir: confirmar,
      },
    });
  };

  const handleClicFecha = (arg: { date?: Date; dateStr: string }) => {
    const selectorDate = new Date(arg.date || arg.dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectorDate < today) {
      mostrarNotificacion('No se pueden crear eventos en fechas pasadas.', 'error');
      return;
    }

    const fechaInicioStr = arg.dateStr.includes('T') ? arg.dateStr : `${arg.dateStr}T09:00`;
    const fechaFin = new Date(new Date(fechaInicioStr).getTime() + 3600000);
    setModal({
      mode: 'new',
      event: {
        nombre_evento: '',
        id_tipo: tiposEvento[0]?.id_tipo || 1,
        descripcion: '',
        fecha_inicio: formatearFechaInput(fechaInicioStr),
        fecha_fin: formatearFechaInput(fechaFin)
      },
    });
  };

  const handleGuardarNuevo = async (form: any) => {
    try {
      const fechaInicio = new Date(form.fecha_inicio);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fechaInicio < today) {
        throw new Error('La fecha de inicio no puede ser anterior a hoy.');
      }

      const eventToSave = {
        id_usuario: currentUser?.id || '',
        nombre_evento: form.nombre_evento,
        id_tipo: form.id_tipo,
        descripcion: form.descripcion || null,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
      };

      await eventRepo.create(eventToSave as any, form.grupos);
      fetchInitialData();
      setModal(null);
      mostrarNotificacion('¡Evento creado correctamente!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      mostrarNotificacion(`Error al guardar: ${message}`, 'error');
    }
  };

  const handleGuardarEdicion = async (form: any) => {
    try {
      const updates = {
        nombre_evento: form.nombre_evento,
        id_tipo: form.id_tipo,
        descripcion: form.descripcion || null,
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
      };

      await eventRepo.update(form.id_evento, updates as any, form.grupos as any);
      fetchInitialData();

      if (form.confirmarAlAbrir) {
        setModal(prev => prev ? ({ ...prev, event: { ...prev.event, ...form } }) : null);
        mostrarNotificacion('Datos actualizados.', 'success');
      } else {
        setModal(null);
        mostrarNotificacion('Evento actualizado correctamente.', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      mostrarNotificacion(`Error al actualizar: ${message}`, 'error');
    }
  };

  const handleFinalizado = (id_evento: number) => {
    setEventos(prev => prev.map(e => e.extendedProps.id_evento === id_evento ? { ...e, extendedProps: { ...e.extendedProps, finalizado: true }, editable: false } : e));
    setModal(null);
    mostrarNotificacion('¡Evento finalizado correctamente!', 'success');
  };

  const handleEliminar = async (evento: { id_evento: number }) => {
    try {
      await eventRepo.delete(evento.id_evento);
      fetchInitialData();
      setModal(null);
      mostrarNotificacion('Evento eliminado.', 'info');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      mostrarNotificacion(`Error al eliminar: ${message}`, 'error');
    }
  };

  const handleCambioEvento = async (cambioInfo: any) => {
    const e = cambioInfo.event;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (e.start < today) {
      cambioInfo.revert();
      mostrarNotificacion('No se pueden mover eventos a fechas pasadas.', 'error');
      return;
    }

    try {
      await eventRepo.update(e.extendedProps.id_evento, {
        fecha_inicio: e.start.toISOString(),
        fecha_fin: (e.end || new Date(e.start.getTime() + 3600000)).toISOString()
      } as any);
      fetchInitialData();
      mostrarNotificacion('Fecha actualizada.', 'success');
    } catch {
      cambioInfo.revert();
      mostrarNotificacion('No se pudo actualizar la fecha.', 'error');
    }
  };

  const proximosEventos = React.useMemo(() => {

    return (eventos as any[])
      .filter(e => new Date(e.end || e.start) >= ahora && !e.extendedProps?.finalizado)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  }, [eventos, ahora]);

  return (
    <div className="h-full overflow-y-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 pr-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Calendario</h2>
          <p className="text-slate-500 dark:text-slate-400">Programación de actividades y gestión del museo.</p>
        </div>
        <CustomButton onClick={() => handleClicFecha({ dateStr: formatearFechaInput(new Date()) })} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Evento
        </CustomButton>
      </div>

      <div className="flex flex-wrap gap-2">
        {tiposEvento.map(({ id_tipo, nombre }) => {
          const c = obtenerColor(nombre);
          return (
            <span key={id_tipo} className="px-3 py-1 rounded-full text-xs font-bold border capitalize" style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}>
              {nombre}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Calendario
          eventos={eventos}
          cargando={cargando}
          onDateClick={handleClicFecha}
          onEventClick={(info) => handleAbrirModalEvento(info.event)}
          onEventChange={handleCambioEvento}
        />

        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Próximos eventos</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {proximosEventos.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8 px-4">No hay eventos próximos.</p>
              ) : (
                proximosEventos.map(ev => {
                  const color = obtenerColor(ev.extendedProps?.nombreTipo || '');
                  const fecha = new Date(ev.start);
                  return (
                    <div key={ev.id} className="flex gap-3 items-start px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleAbrirModalEvento(ev)}>
                      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold text-center" style={{ backgroundColor: color.bg, color: color.text }}>
                        <span className="text-lg leading-none">{fecha.getDate()}</span>
                        <span className="text-[9px] uppercase tracking-wider">{fecha.toLocaleString('es-ES', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <EventModal
          event={modal.event}
          isNew={modal.mode === 'new'}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'new' ? handleGuardarNuevo : handleGuardarEdicion}
          onDelete={handleEliminar}
          onFinalized={handleFinalizado}
          onShowError={(msg) => mostrarNotificacion(msg, 'error')}
          tiposEvento={tiposEvento}
        />
      )}

      <Snackbar
        open={notificacion.open}
        autoHideDuration={notificacion.tipo === 'warning' ? null : 5000}
        onClose={handleCerrarNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="z-[100]"
        action={notificacion.action}
      >
        <Alert
          onClose={handleCerrarNotificacion}
          severity={notificacion.tipo}
          variant="filled"
          action={notificacion.action}
          sx={{ width: '100%', minWidth: '300px', borderRadius: '16px' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
};
