import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const VistaCalendario = () => {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const upcomingEvents = [
    { id: 1, title: 'Visita Escolar CEIP', date: '12 Oct', time: '10:00 - 13:00', type: 'Visita' },
    { id: 2, title: 'Inauguración Arte Sacro', date: '24 Oct', time: '18:00 - 20:00', type: 'Evento' },
    { id: 3, title: 'Mantenimiento Sala 2', date: '28 Oct', time: 'Todo el día', type: 'Mantenimiento' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Calendario</h2>
          <p className="text-slate-500">Programación de actividades y gestión del museo.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
            Hoy
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendario */}
        <Card className="xl:col-span-2 border-none shadow-xl">
          <CardHeader>
            <CardTitle>Octubre 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <div 
                  key={d} 
                  className={`min-h-[5rem] border border-slate-100 rounded-xl p-2 hover:border-blue-200 hover:shadow-md transition-all relative bg-white group cursor-pointer ${
                    d === 12 ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <span className={`text-sm font-semibold ${d === 12 ? 'text-blue-600' : 'text-slate-500'}`}>
                    {d <= 31 ? d : ''}
                  </span>
                  {d === 12 && (
                    <div className="mt-2 p-1.5 bg-blue-100 text-blue-700 text-[10px] rounded-lg font-bold truncate border border-blue-200">
                      Visita Escolar
                    </div>
                  )}
                  {d === 24 && (
                    <div className="mt-2 p-1.5 bg-purple-100 text-purple-700 text-[10px] rounded-lg font-bold truncate border border-purple-200">
                      Exposición
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista eventos */}
        <Card className="border-none shadow-xl h-fit bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex gap-4 items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shadow-inner ${
                  event.type === 'Visita' ? 'bg-blue-100 text-blue-600' :
                  event.type === 'Evento' ? 'bg-purple-100 text-purple-600' : 
                  'bg-slate-100 text-slate-600'
                }`}>
                  <span>{event.date.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase">{event.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                  <p className="text-xs text-slate-500">{event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};