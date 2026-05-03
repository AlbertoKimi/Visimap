import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { formatearFecha } from '@/utils/utils';
import { TablaGenerica } from '@/components/ui/TablaGenerica';
import { ColumnDef, ColumnFilter } from '@/interfaces/ui';
import { RegistroEvento } from '@/interfaces/Evento';
import { TablaRegistroEventosProps } from '@/interfaces/components';

export const TablaRegistroEventos: React.FC<TablaRegistroEventosProps> = ({
  registros,
  onDelete,
  onEdit,
  onDeleteSelected,
  onRowClick,
}) => {
  const columns: ColumnDef<RegistroEvento>[] = [
    {
      key: 'evento.nombre_evento',
      header: 'Nombre del Evento',
      sortable: true,
      render: (reg) => (
        <span className="font-bold text-slate-700 dark:text-slate-200">
          {reg.evento?.nombre_evento || 'Evento sin nombre'}
        </span>
      ),
    },
    {
      key: 'origen',
      header: 'Ubicación (Origen)',
      sortable: true,
      render: (reg) => (
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">{reg.origen}</span>
          <span className="text-[10px] uppercase font-bold text-slate-300 dark:text-slate-600 ml-1">{reg.tipo_origen}</span>
        </div>
      ),
    },
    {
      key: 'num_visitantes',
      header: 'Nº Visitantes',
      sortable: true,
      render: (reg) => (
        <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{reg.num_visitantes}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha de Creación',
      sortable: true,
      render: (reg) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{formatearFecha(reg.created_at)}</span>
      ),
    },
    {
      key: 'registrado_por',
      header: 'Registrado por',
      sortable: false,
      render: (reg) => (
        <div className="flex items-center gap-2">
          {reg.evento?.perfil?.avatar_url && (
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
              <img src={reg.evento.perfil.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {reg.evento?.perfil?.nombre_usuario || reg.evento?.perfil?.nombre || 'Desconocido'}
          </span>
        </div>
      ),
    },
    {
      key: '_actions',
      header: 'Acciones',
      render: (reg) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(reg); }}
            className="p-1.5 lg:p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-indigo-200 dark:hover:shadow-none active:scale-95"
            title="Modificar"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(reg.id_grupo); }}
            className="p-1.5 lg:p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-red-200 dark:hover:shadow-none active:scale-95"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const columnFilters: ColumnFilter<RegistroEvento>[] = [
    {
      key: 'tipo_origen',
      label: 'Tipo origen',
      options: [
        { label: 'Provincia', value: 'provincia' },
        { label: 'País', value: 'pais' },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300">
      <TablaGenerica<RegistroEvento>
        data={registros}
        columns={columns}
        getRowId={(reg) => reg.id_grupo}
        onRowClick={onRowClick}
        columnFilters={columnFilters}
        searchPlaceholder="Buscar por evento, origen o usuario..."
        searchKeys={[
          'evento.nombre_evento',
          'origen',
          'evento.perfil.nombre_usuario',
          'evento.perfil.nombre',
        ]}
        onDeleteSelected={onDeleteSelected}
        deleteSelectedLabel="Eliminar seleccionados"
        pageSize={10}
        emptyMessage="No hay registros de eventos"
        emptyDescription="No se han encontrado registros de visitantes asociados a eventos."
      />
    </div>
  );
};
