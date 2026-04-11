import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { formatearFecha } from '../utils/utils';

interface TablaRegistroEventosProps {
  registros: any[];
  onDelete: (id: number) => void;
  onEdit: (registro: any) => void;
}

export const TablaRegistroEventos: React.FC<TablaRegistroEventosProps> = ({ 
  registros, 
  onDelete, 
  onEdit 
}) => {
  if (!registros || registros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-200 transition-all">
        <h3 className="text-xl font-bold text-slate-800">No hay registros de eventos</h3>
        <p className="text-slate-500 max-w-sm mt-3 leading-relaxed">
          No se han encontrado registros de visitantes asociados a eventos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 transition-all duration-300">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/80 backdrop-blur-sm">
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Nombre del Evento</th>
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Ubicación (Origen)</th>
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Nº Visitantes</th>
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Fecha de Creación</th>
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Registrado por</th>
              <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {registros.map((reg) => (
              <tr key={reg.id_grupo} className="group hover:bg-blue-50/80 transition-all duration-200">
                <td className="px-8 py-6">
                  <span className="font-bold text-slate-700">
                    {reg.evento?.nombre_evento || 'Evento sin nombre'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">{reg.origen}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-300 ml-1">{reg.tipo_origen}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-bold text-slate-800 text-lg">{reg.num_visitantes}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-slate-500">
                    {formatearFecha(reg.created_at)}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {reg.evento?.perfil?.avatar_url && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <img src={reg.evento.perfil.avatar_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-slate-600">
                      {reg.evento?.perfil?.nombre_usuario || reg.evento?.perfil?.nombre || 'Desconocido'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end gap-2 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(reg)}
                      className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
                      title="Modificar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(reg.id_grupo)}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-red-200 active:scale-95"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
