import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { CalendarioProps } from '@/interfaces/components';

const PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin];
const LOCALE = esLocale;
const HORAS = Array.from({ length: 15 }, (_, i) => i + 8);

const renderEventContent = (arg: any) => {
  const { finalizado } = arg.event.extendedProps;
  const isList = arg.view.type.includes('list');

  if (isList) {
    return (
      <div className="flex items-center gap-2">
        {finalizado && <Check size={14} strokeWidth={4} className="text-emerald-500" />}
        <span className="font-medium text-slate-700 dark:text-slate-300">{arg.event.title}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 w-full overflow-hidden px-1.5 py-0.5 rounded-md shadow-sm border border-black/5"
      style={{ backgroundColor: arg.event.backgroundColor, color: arg.event.textColor }}
    >
      {finalizado && <Check size={10} strokeWidth={5} className="shrink-0" />}
      <span className="truncate font-bold text-[10px] uppercase tracking-tighter">
        {arg.event.title}
      </span>
    </div>
  );
};



/**
 * Componente de Calendario Interactivo.
 * Integra FullCalendar para visualización mensual/anual y una implementación personalizada
 * para las vistas semanales y diarias con mayor densidad de información.
 * Gestiona estados de carga, navegación entre fechas y cambio de vistas dinámicas.
 * @param props - Eventos a mostrar y manejadores de interacción (click en fecha/evento).
 * @returns Componente de calendario dentro de una tarjeta estilizada.
 */
export const Calendario: React.FC<CalendarioProps> = ({
  eventos,
  cargando,
  onDateClick,
  onEventClick,
}) => {
  const [vista, setVista] = useState<'mes' | 'semana' | 'dia' | 'año' | 'agenda'>('mes');
  const [fechaActual, setFechaActual] = useState(new Date());

  const calendarRef = React.useRef<any>(null);

  const diasSemana = React.useMemo(() => {
    const inicioSemana = new Date(fechaActual);
    const dia = inicioSemana.getDay();
    const diff = inicioSemana.getDate() - dia + (dia === 0 ? -6 : 1);
    inicioSemana.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      return {
        raw: d,
        id: d.toISOString(),
        num: d.getDate(),
        label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      };
    });
  }, [fechaActual]);

  const mapEventos = React.useMemo(() => {
    const map = new Map<string, any[]>();
    eventos.forEach(ev => {
      const d = new Date(ev.start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    return map;
  }, [eventos]);


  const navegar = (direccion: number) => {

    if (calendarRef.current && (vista === 'mes' || vista === 'año' || vista === 'agenda')) {
      const api = calendarRef.current.getApi();
      if (direccion === 1) api.next();
      else if (direccion === -1) api.prev();
      else api.today();
      return;
    }

    const nuevaFecha = new Date(fechaActual);
    if (vista === 'semana') nuevaFecha.setDate(fechaActual.getDate() + (7 * direccion));
    else if (vista === 'dia') nuevaFecha.setDate(fechaActual.getDate() + direccion);
    setFechaActual(nuevaFecha);
  };
  return (
    <Card className="xl:col-span-3 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
      <CardContent className="p-0 sm:p-4 h-full min-h-[800px]">

        <div className="flex flex-col gap-4 mb-4 sm:mb-8 px-1 sm:px-2">

          <div className="flex justify-center w-full">
            <h2 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight bg-slate-50 dark:bg-slate-800 px-4 sm:px-6 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-2 w-full lg:w-auto justify-center">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700">
                <button
                  onClick={() => navegar(-1)}
                  className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
                  title="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => navegar(1)}
                  className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm"
                  title="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                onClick={() => {
                  if (calendarRef.current && (vista === 'mes' || vista === 'año' || vista === 'agenda')) {
                    calendarRef.current.getApi().today();
                  } else {
                    setFechaActual(new Date());
                  }
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm sm:text-base font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 transition-all shadow-sm border border-blue-100 dark:border-blue-900/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Hoy
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner gap-0.5 sm:gap-1 border border-slate-200/50 dark:border-slate-700 w-full lg:w-auto overflow-x-auto no-scrollbar justify-start lg:justify-center">
              {(['año', 'mes', 'semana', 'dia', 'agenda'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`flex-1 lg:flex-none px-2.5 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${vista === v ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {cargando && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}


        <div className={vista === 'mes' || vista === 'año' || vista === 'agenda' ? 'h-[600px] sm:h-[750px] dark-calendar-wrapper' : 'hidden'}>
          <FullCalendar
            key={vista}
            ref={calendarRef}
            plugins={PLUGINS}
            initialView={vista === 'mes' ? 'dayGridMonth' : vista === 'año' ? 'multiMonthYear' : 'listWeek'}
            headerToolbar={false}
            locale={LOCALE}
            initialDate={fechaActual}
            events={eventos}
            editable={true}
            selectable={true}
            height="100%"
            dayMaxEvents={true}
            dateClick={onDateClick}
            eventClick={onEventClick}
            eventClassNames={(arg: any) => arg.event.extendedProps.finalizado ? ['event-finalizado'] : []}
            eventContent={renderEventContent}
            selectAllow={(selectInfo) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return selectInfo.start >= today;
            }}
            eventAllow={(dropInfo) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return dropInfo.start >= today;
            }}

            datesSet={(arg) => {
              if (arg.view.calendar.getDate().toDateString() !== fechaActual.toDateString()) {
                setFechaActual(arg.view.calendar.getDate());
              }
            }}
          />
        </div>


        {/* Vista Semana / Día */}
        <div className={vista === 'semana' || vista === 'dia' ? 'relative' : 'hidden'}>
          <div className="h-[600px] sm:h-[750px] overflow-y-auto sm:overflow-y-hidden overflow-x-auto sm:overflow-x-hidden custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <table
              className="border-collapse w-full sm:h-full"
              style={{ minWidth: vista === 'semana' ? '520px' : '260px' }}
            >
              {/*sticky en móvil (scroll), normal en desktop */}
              <thead className="sticky top-0 z-20 sm:static">
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  {/* Columna HORA — sticky-left en móvil, normal en desktop */}
                  <th
                    className="bg-slate-50 dark:bg-slate-800/50 p-2 text-[10px] font-black text-slate-400 uppercase text-center"
                    style={{ position: 'sticky', left: 0, zIndex: 30, width: '64px', minWidth: '52px', maxWidth: '80px' }}
                  >
                    HORA
                  </th>
                  {(vista === 'semana' ? diasSemana : [diasSemana.find(d => d.raw.toDateString() === fechaActual.toDateString()) || diasSemana[0]]).map((diaObj) => (
                    <th key={diaObj.id} className="p-2 sm:p-3 text-center border-l border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{diaObj.label}</div>
                      <div className={`text-sm sm:text-lg font-black ${diaObj.raw.toDateString() === new Date().toDateString() ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{diaObj.num}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORAS.map((h) => (
                  <tr
                    key={h}
                    className="group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    style={{ height: `${100 / HORAS.length}%` }}
                  >
                    {/* Celda HORA — sticky-left en móvil, normal en desktop */}
                    <td
                      className="bg-white dark:bg-slate-900 p-1 text-center text-[11px] font-bold text-slate-400 align-top pt-3 select-none"
                      style={{ position: 'sticky', left: 0, zIndex: 10, width: '64px', minWidth: '52px', maxWidth: '80px', borderRight: '1px solid rgba(148,163,184,0.15)' }}
                    >
                      {h}:00
                    </td>
                    {(vista === 'semana' ? diasSemana : [diasSemana.find(d => d.raw.toDateString() === fechaActual.toDateString()) || diasSemana[0]]).map((diaObj) => {
                      const cellKey = `${diaObj.key}-${h}`;
                      const evs = mapEventos.get(cellKey) || [];
                      return (
                        <td key={diaObj.id} className="p-1 border-l border-slate-100 dark:border-slate-800 align-top">
                          <div className="flex flex-col gap-1.5 h-full">
                            {evs.map((ev) => {
                              const start = new Date(ev.start);
                              return (
                                <div
                                  key={ev.id}
                                  onClick={() => onEventClick?.({ event: { id: ev.id, title: ev.title, extendedProps: ev.extendedProps, backgroundColor: ev.backgroundColor, textColor: ev.textColor } })}
                                  className="p-1.5 sm:p-2 rounded-lg shadow-sm border-l-4 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden"
                                  style={{ backgroundColor: ev.backgroundColor, color: ev.textColor, borderLeftColor: ev.color || 'transparent' }}
                                >
                                  <div className="flex items-center gap-1">
                                    {ev.extendedProps?.finalizado && <Check size={10} strokeWidth={4} className="text-emerald-400 shrink-0" />}
                                    <span className="text-[9px] sm:text-[10px] font-black whitespace-nowrap opacity-60">
                                      {start.getHours()}:{start.getMinutes().toString().padStart(2, '0')}
                                    </span>
                                  </div>
                                  <div className="text-[10px] sm:text-[11px] font-bold uppercase leading-tight mt-0.5 line-clamp-2">
                                    {ev.title}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
