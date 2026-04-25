import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { formatearFecha } from '@/utils/utils';
import { TablaGenerica, ColumnDef, ColumnFilter } from '@/components/ui/TablaGenerica';

interface RegistroMapa {
  id_registro: number;
  cantidad: number;
  tipo_visita: 'individual' | 'grupo';
  creado_en: string;
  provincia?: { nombre_provincia: string };
  pais?: { nombre_pais: string };
  perfil?: { nombre_usuario?: string; nombre?: string; avatar_url?: string };
  [key: string]: unknown;
}

interface TablaRegistroMapaProps {
  registros: RegistroMapa[];
  onDelete: (id: number) => void;
  onEdit: (registro: RegistroMapa) => void;
  onDeleteSelected?: (ids: (string | number)[]) => void;
}

export const TablaRegistroMapa: React.FC<TablaRegistroMapaProps> = ({
  registros,
  onDelete,
  onEdit,
  onDeleteSelected,
}) => {
  const columns: ColumnDef<RegistroMapa>[] = [
    {
      key: 'ubicacion',
      header: 'Ubicación',
      sortable: true,
      render: (reg) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {reg.provincia?.nombre_provincia || reg.pais?.nombre_pais || '—'}
        </span>
      ),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      render: (reg) => (
        <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{reg.cantidad}</span>
      ),
    },
    {
      key: 'creado_en',
      header: 'Fecha',
      sortable: true,
      render: (reg) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{formatearFecha(reg.creado_en)}</span>
      ),
    },
    {
      key: 'tipo_visita',
      header: 'Tipo Visita',
      sortable: true,
      render: (reg) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
            reg.tipo_visita === 'individual'
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
          }`}
        >
          {reg.tipo_visita}
        </span>
      ),
    },
    {
      key: 'registrado_por',
      header: 'Registrado por',
      sortable: false,
      render: (reg) => (
        <div className="flex items-center gap-2">
          {reg.perfil?.avatar_url && (
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
              <img src={reg.perfil.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {reg.perfil?.nombre_usuario || reg.perfil?.nombre || 'Desconocido'}
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
            className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-blue-200 dark:hover:shadow-none active:scale-95"
            title="Modificar"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(reg.id_registro); }}
            className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-red-200 dark:hover:shadow-none active:scale-95"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const columnFilters: ColumnFilter<RegistroMapa>[] = [
    {
      key: 'tipo_visita',
      label: 'Tipo visita',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Grupo', value: 'grupo' },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300">
      <TablaGenerica<RegistroMapa>
        data={registros}
        columns={columns}
        getRowId={(reg) => reg.id_registro}
        columnFilters={columnFilters}
        searchPlaceholder="Buscar por ubicación o usuario..."
        searchKeys={[
          'provincia.nombre_provincia',
          'pais.nombre_pais',
          'perfil.nombre_usuario',
          'perfil.nombre',
        ]}
        onDeleteSelected={onDeleteSelected}
        deleteSelectedLabel="Eliminar seleccionados"
        pageSize={10}
        emptyMessage="No hay registros del mapa"
        emptyDescription="No se han encontrado registros manuales para los filtros seleccionados."
      />
    </div>
  );
};
