import { Plus, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export const VistaUsuarios = () => {
  const workers = [
    { id: 1, name: 'Ana Martínez', role: 'Guía', email: 'ana.m@muvi.es', status: 'Activo' },
    { id: 2, name: 'Carlos Ruiz', role: 'Seguridad', email: 'carlos.r@muvi.es', status: 'Vacaciones' },
    { id: 3, name: 'Laura Gómez', role: 'Administración', email: 'laura.g@muvi.es', status: 'Activo' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Equipo de Trabajo</h2>
          <p className="text-slate-500">Gestiona los permisos y el personal del museo.</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Añadir Trabajador
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
                  <th className="p-6 font-semibold">Nombre</th>
                  <th className="p-6 font-semibold">Rol</th>
                  <th className="p-6 font-semibold">Estado</th>
                  <th className="p-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold border border-white shadow-sm">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{worker.name}</p>
                          <p className="text-xs text-slate-400">{worker.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {worker.role}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        worker.status === 'Activo' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          worker.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {worker.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};