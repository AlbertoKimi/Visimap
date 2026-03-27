import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Snackbar, Alert, Button } from '@mui/material';
import { EventModal } from '../components/modales/EventModal';
import { Calendario } from '../components/Calendario';
import { obtenerColor } from '../constantes/constantes';
import { formatearFechaInput } from '../utils/utils';
import { Button as CustomButton } from '../components/button';

export const VistaCalendario = ({ session }) => {
  const [eventos, setEventos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { event, x, y }
  const [ahora, setAhora] = useState(new Date());
  const [notificados, setNotificados] = useState(new Set());

  // Actualizar "ahora" cada minuto
  useEffect(() => {
    const temporizador = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(temporizador);
  }, []);

  // 3 próximos eventos
  const proximosEventos = eventos
    .filter(e => new Date(e.end || e.start) >= ahora && !e.extendedProps?.finalizado)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 3);

  // ── Notificaciones ─────────────────────────────────────────────────────────
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', tipo: 'success', action: null });
  const handleCerrarNotificacion = (_, razon) => {
    if (razon === 'clickaway') return;
    setNotificacion(n => ({ ...n, open: false }));
  };
  const mostrarNotificacion = (mensaje, tipo = 'success', action = null) => {
    setNotificacion({ open: true, mensaje, tipo, action });
  };

  // ── Cargar tipos y eventos ─────────────────────────────────────────────────
  useEffect(() => {
    obtenerTipos();
    obtenerEventos();
  }, []);

  // ── UseEffect para ver los eventos terminados ───────────────────────────────
  useEffect(() => {
    if (cargando) return;
    const eventoTerminado = eventos.find(e => {
      const fechaFin = new Date(e.end || e.start);
      return fechaFin < ahora && !e.extendedProps?.finalizado && !notificados.has(e.extendedProps?.id_evento);
    });

    if (eventoTerminado) {
      setNotificados(prev => new Set(prev).add(eventoTerminado.extendedProps.id_evento));
      mostrarNotificacion(
        `El evento "${eventoTerminado.title}" ha terminado.`,
        'info',
        <Button
          size="small"
          onClick={() => handleAbrirModalEvento(eventoTerminado, true)}
          sx={{ color: 'white', fontWeight: 'bold', textTransform: 'none', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          Confirmar finalización
        </Button>
      );
    }
  }, [ahora, eventos, cargando, notificados]);

  const obtenerTipos = async () => {
    const { data, error } = await supabase.from('tipo_evento').select('id_tipo, nombre').order('nombre');
    if (!error && data) setTiposEvento(data);
  };

  const obtenerEventos = async () => {
    setCargando(true);
    const { data, error } = await supabase.from('evento').select('*, tipo_evento(nombre)').order('fecha_inicio');
    if (error) {
      mostrarNotificacion('Error al cargar los eventos.', 'error');
    } else if (data) {
      const mapearEventoDB = (ev) => {
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
          editable: !ev.finalizado, // Evitar modificación en el calendario si está finalizado
        };
      };
      setEventos(data.map(mapearEventoDB));
    }
    setCargando(false);
  };

  // ── MANEJO DE MODALES ─────────────────────────────────────────────────────
  const handleAbrirModalEvento = (e, confirmar = false) => {
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

  const handleClicFecha = (arg) => {
    const fechaInicioStr = arg.dateStr.includes('T') ? arg.dateStr : `${arg.dateStr}T09:00`;
    const fechaFin = new Date(new Date(fechaInicioStr).getTime() + 3600000);
    setModal({
      mode: 'new',
      event: { nombre_evento: '', id_tipo: tiposEvento[0]?.id_tipo || '', descripcion: '', fecha_inicio: formatearFechaInput(fechaInicioStr), fecha_fin: formatearFechaInput(fechaFin) },
    });
  };

  const handleGuardarNuevo = async (form) => {
    const { data, error } = await supabase.from('evento').insert([{
      id_usuario: session?.user?.id,
      nombre_evento: form.nombre_evento,
      id_tipo: form.id_tipo,
      descripcion: form.descripcion || null,
      fecha_inicio: new Date(form.fecha_inicio).toISOString(),
      fecha_fin: new Date(form.fecha_fin).toISOString(),
    }]).select('*, tipo_evento(nombre)').single();

    if (error) {
      mostrarNotificacion(`Error al guardar: ${error.message}`, 'error');
      return;
    }
    if (data) {
      if (form.grupos?.length > 0) {
        const filas = form.grupos.map(g => ({ id_evento: data.id_evento, tipo_origen: g.tipo_origen, origen: g.origen, num_visitantes: g.num_visitantes }));
        await supabase.from('grupo_visitante').insert(filas);
      }
      obtenerEventos();
      setModal(null);
      mostrarNotificacion('¡Evento creado correctamente!', 'success');
    }
  };

  const handleGuardarEdicion = async (form) => {
    const { error } = await supabase.from('evento').update({
      nombre_evento: form.nombre_evento,
      id_tipo: form.id_tipo,
      descripcion: form.descripcion || null,
      fecha_inicio: new Date(form.fecha_inicio).toISOString(),
      fecha_fin: new Date(form.fecha_fin).toISOString(),
    }).eq('id_evento', form.id_evento);

    if (error) {
      mostrarNotificacion(`Error al actualizar: ${error.message}`, 'error');
      return;
    }
    await supabase.from('grupo_visitante').delete().eq('id_evento', form.id_evento);
    if (form.grupos?.length > 0) {
      const filas = form.grupos.map(g => ({ id_evento: form.id_evento, tipo_origen: g.tipo_origen, origen: g.origen, num_visitantes: g.num_visitantes }));
      await supabase.from('grupo_visitante').insert(filas);
    }
    await obtenerEventos();
    if (form.confirmarAlAbrir) {
      setModal(prev => ({ ...prev, event: { ...prev.event, ...form } }));
      mostrarNotificacion('Datos actualizados.', 'success');
    } else {
      setModal(null);
      mostrarNotificacion('Evento actualizado correctamente.', 'success');
    }
  };

  const handleFinalizado = (id_evento) => {
    setEventos(prev => prev.map(e => e.extendedProps.id_evento === id_evento ? { ...e, extendedProps: { ...e.extendedProps, finalizado: true } } : e));
    setModal(null);
    mostrarNotificacion('¡Evento finalizado correctamente!', 'success');
  };

  const handleEliminar = async (evento) => {
    const { error } = await supabase.from('evento').delete().eq('id_evento', evento.id_evento);
    if (error) {
      mostrarNotificacion(`Error al eliminar: ${error.message}`, 'error');
    } else {
      obtenerEventos();
      setModal(null);
      mostrarNotificacion('Evento eliminado.', 'info');
    }
  };

  const handleCambioEvento = async (cambioInfo) => {
    const e = cambioInfo.event;
    const { error } = await supabase.from('evento').update({
      fecha_inicio: e.start.toISOString(),
      fecha_fin: (e.end || new Date(e.start.getTime() + 3600000)).toISOString()
    }).eq('id_evento', e.extendedProps.id_evento);

    if (error) {
      cambioInfo.revert();
      mostrarNotificacion('No se pudo actualizar la fecha.', 'error');
    } else {
      obtenerEventos();
      mostrarNotificacion('Fecha actualizada.', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Calendario</h2>
          <p className="text-slate-500">Programación de actividades y gestión del museo.</p>
        </div>
        <CustomButton onClick={() => handleClicFecha({ dateStr: formatearFechaInput(new Date()) })} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Evento
        </CustomButton>
      </div>

      {/* Leyenda */}

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
          onMouseEnter={(info) => {
            const rect = info.el.getBoundingClientRect();
            setTooltip({ event: info.event, x: rect.right + 10, y: Math.min(rect.top, window.innerHeight - 200) });
          }}
          onMouseLeave={() => setTooltip(null)}
        />

        {/* Sidebar: Próximos eventos */}

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Próximos eventos</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {proximosEventos.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8 px-4">No hay eventos próximos.</p>
              ) : (
                proximosEventos.map(ev => {
                  const color = obtenerColor(ev.extendedProps?.nombreTipo || '');
                  const fecha = new Date(ev.start);
                  return (
                    <div key={ev.id} className="flex gap-3 items-start px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleAbrirModalEvento(ev)}>
                      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold text-center" style={{ backgroundColor: color.bg, color: color.text }}>
                        <span className="text-lg leading-none">{fecha.getDate()}</span>
                        <span className="text-[9px] uppercase tracking-wider">{fecha.toLocaleString('es-ES', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
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

      {tooltip && (() => {
        const ev = tooltip.event;
        const color = obtenerColor(ev.extendedProps?.nombreTipo || '');
        return (
          <div style={{ position: 'fixed', top: tooltip.y, left: Math.min(tooltip.x, window.innerWidth - 270), zIndex: 9999, pointerEvents: 'none' }} className="w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize mb-2 inline-block" style={{ backgroundColor: color.bg, color: color.text }}>{ev.extendedProps?.nombreTipo}</span>
            <p className="font-bold text-slate-800 text-sm leading-tight">{ev.title}</p>
            <p className="text-xs text-slate-500 mt-1 italic text-slate-300">Haz clic para más detalles</p>
          </div>
        );
      })()}

      <Snackbar open={notificacion.open} autoHideDuration={notificacion.action ? 10000 : 5000} onClose={handleCerrarNotificacion} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} className="z-[100]">
        <Alert onClose={handleCerrarNotificacion} severity={notificacion.tipo} variant="filled" sx={{ width: '100%', minWidth: '300px', borderRadius: '16px', '& .MuiAlert-message': { width: '100%' } }}>
          <div className="flex flex-col gap-2">
            <span>{notificacion.mensaje}</span>
            {notificacion.action && <div className="flex justify-end mt-1">{notificacion.action}</div>}
          </div>
        </Alert>
      </Snackbar>
    </div>
  );
};