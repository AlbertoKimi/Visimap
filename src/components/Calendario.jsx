
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { Loader2 } from 'lucide-react';
import { FONDO_DEFECTO } from '../constantes/constantes';
import '../styles/Calendario.css';

export const Calendario = ({
  eventos,
  cargando,
  onDateClick,
  onEventClick,
  onEventChange,
  onMouseEnter,
  onMouseLeave
}) => {

  // Función para obtener contraste de texto si fuera necesario en el futuro
  const obtenerContrasteTexto = (hex) => '#4a4a6a';

  return (
    <div className="xl:col-span-3 bg-white rounded-2xl shadow-2xl overflow-hidden p-4">
      {cargando ? (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando eventos...</span>
        </div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="es"
          buttonText={{ today: 'Hoy', year: 'Año', month: 'Mes', week: 'Semana', day: 'Día' }}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          events={eventos}
          editable={true}
          selectable={true}
          dayMaxEvents={true}
          nowIndicator={true}
          scrollTime="08:00:00"
          dateClick={onDateClick}
          eventClick={onEventClick}
          eventChange={onEventChange}
          height="auto"
          eventMouseEnter={onMouseEnter}
          eventMouseLeave={onMouseLeave}
          eventContent={(info) => {
            const bg = info.event.backgroundColor || FONDO_DEFECTO;
            const colorTexto = info.event.textColor || obtenerContrasteTexto(bg);
            const estaFinalizado = info.event.extendedProps?.finalizado;
            return (
              <div
                className="px-2 py-1 text-[11px] font-bold truncate w-full h-full rounded-[5px] flex items-center gap-1"
                style={{ backgroundColor: bg, color: colorTexto, opacity: estaFinalizado ? 0.75 : 1 }}
              >
                {estaFinalizado && <span className="shrink-0">✓</span>}
                {info.timeText && <span className="opacity-80 mr-1">{info.timeText}</span>}
                {info.event.title}
              </div>
            );
          }}
        />
      )}

    </div>
  );
};
