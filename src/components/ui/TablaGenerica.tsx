import React, { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { ModalConfirmacion } from '@/components/app/modales/ModalConfirmacion';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnFilter<T = any> {
  key: string;
  label: string;
  options: FilterOption[];
  filterFn?: (row: T, value: string) => boolean;
}

export interface TablaGenericaProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string | number;
  columnFilters?: ColumnFilter<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onDeleteSelected?: (ids: (string | number)[]) => void;
  deleteSelectedLabel?: string;
  pageSize?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
}

function toStr(val: any): string {
  if (val == null) return '';
  return String(val).toLowerCase();
}

function calcularPaginas(totalPages: number, currentPage: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }
  return pages;
}

export function TablaGenerica<T>({
  data,
  columns,
  getRowId,
  columnFilters = [],
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  onDeleteSelected,
  deleteSelectedLabel = 'Marcar inactivos',
  pageSize = 10,
  emptyMessage = 'No hay registros',
  emptyDescription = 'No se encontraron resultados para los filtros aplicados.',
  emptyIcon,
}: TablaGenericaProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);

  let filtered = [...data];

  if (search.trim() && searchKeys.length > 0) {
    const q = search.toLowerCase();
    filtered = filtered.filter(row =>
      searchKeys.some(key => toStr(getNestedValue(row, key)).includes(q))
    );
  }

  for (const filter of columnFilters) {
    const val = filterValues[filter.key];
    if (!val || val === '__all__') continue;
    if (filter.filterFn) {
      filtered = filtered.filter(row => filter.filterFn!(row, val));
    } else {
      filtered = filtered.filter(row => toStr(getNestedValue(row, filter.key)) === toStr(val));
    }
  }

  // Ordenación
  const sorted = sortKey && sortDir
    ? [...filtered].sort((a, b) => {
      const va = toStr(getNestedValue(a, sortKey));
      const vb = toStr(getNestedValue(b, sortKey));
      const cmp = va.localeCompare(vb, 'es', { sensitivity: 'base', numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    })
    : filtered;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const pageNumbers = calcularPaginas(totalPages, currentPage);

  // Manejadores de eventos
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setSelected(new Set());
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else setSortDir('asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Selección de filas
  const pageIds = paginated.map(row => getRowId(row));
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const somePageSelected = pageIds.some(id => selected.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const toggleRow = (id: string | number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selected.size > 0) {
      onDeleteSelected(Array.from(selected));
      setSelected(new Set());
      setModalAbierto(false);
    }
  };

  // Icono de ordenación según estado
  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ChevronsUpDown size={14} className="text-slate-300 ml-1 flex-shrink-0" />;
    if (sortDir === 'asc')
      return <ChevronUp size={14} className="text-blue-500 ml-1 flex-shrink-0" />;
    return <ChevronDown size={14} className="text-blue-500 ml-1 flex-shrink-0" />;
  };

  return (
    <>
      <div className="flex flex-col gap-0">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100">
        {/* Búsqueda */}
        <div className="relative flex-1 group min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="input-style-comun input-border-primario pl-9 max-w-xs"
          />
        </div>

        {/* Filtros desplegables */}
        <div className="flex flex-wrap items-center gap-2">
          {columnFilters.map(filter => (
            <select
              key={filter.key}
              value={filterValues[filter.key] || '__all__'}
              onChange={e => handleFilter(filter.key, e.target.value)}
              className="input-style-comun select-responsive select-color-text w-auto min-w-[130px] py-2"
            >
              <option value="__all__">{filter.label}: Todos</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Botón acción masiva */}
          {onDeleteSelected && selected.size > 0 && (
            <button
              onClick={() => setModalAbierto(true)}
              className="btn-danger flex items-center gap-1.5 whitespace-nowrap animate-in fade-in duration-200"
            >
              <Trash2 size={15} />
              {deleteSelectedLabel}
              <span className="ml-1 bg-white/20 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                {selected.size}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            {emptyIcon && (
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                {emptyIcon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-700">{emptyMessage}</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">{emptyDescription}</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/80">
                {/* Checkbox seleccionar todos */}
                {onDeleteSelected && (
                  <th className="px-5 py-4 border-b border-slate-100 w-10">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={allPageSelected}
                      ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                      onChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                )}

                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 select-none ${col.sortable ? 'cursor-pointer hover:text-blue-600 hover:bg-blue-50/40 transition-colors' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.header}
                      {col.sortable && <SortIcon colKey={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(row => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    className={`group transition-all duration-150 ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}`}
                  >
                    {/* Checkbox fila */}
                    {onDeleteSelected && (
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label={`Seleccionar fila ${id}`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                        {col.render
                          ? col.render(row)
                          : String(getNestedValue(row, col.key) ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Mostrando{' '}
            <span className="font-semibold text-slate-600">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-slate-600">{sorted.length}</span> registros
          </p>

          <div className="order-1 sm:order-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {pageNumbers.map((p, i) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={p === currentPage}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>

      <ModalConfirmacion
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={handleDeleteSelected}
        titulo={deleteSelectedLabel}
        mensaje={`Esta acción afectará a ${selected.size} elemento(s) seleccionado(s) y no se podrá deshacer.`}
        tipo="danger"
      />
    </>
  );
}
