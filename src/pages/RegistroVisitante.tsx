import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { RepositoryFactory } from '../database/RepositoryFactory';
import { TablaRegistroMapa } from '../components/TablaRegistroMapa';
import { TablaRegistroEventos } from '../components/TablaRegistroEventos';
import { ModalConfirmacion } from '../components/modales/ModalConfirmacion';
import { ModalEditarCantidad } from '../components/modales/ModalEditarCantidad';
import { Toast } from '../components/Toast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const ITEMS_PER_PAGE = 20;

export const RegistroVisitante: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mapa' | 'eventos'>('mapa');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const visitorRepo = RepositoryFactory.getVisitorRepository();
  const eventRepo = RepositoryFactory.getEventRepository();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let results;
      if (activeTab === 'mapa') {
        results = await visitorRepo.getAllRegistros();
      } else {
        results = await eventRepo.getAllGrupoVisitantes();
      }
      setData(results);
    } catch (err: any) {
      setError('Error al cargar la información: ' + (err.message || 'Error del servidor'));
      showToast('No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });

  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();

    return data.filter(item => {
      if (activeTab === 'mapa') {
        const prov = item.provincia?.nombre_provincia?.toLowerCase() || '';
        const pais = item.pais?.nombre_pais?.toLowerCase() || '';
        return prov.includes(query) || pais.includes(query);
      } else {
        const origen = item.origen?.toLowerCase() || '';
        const evento = item.evento?.nombre_evento?.toLowerCase() || '';
        return origen.includes(query) || evento.includes(query);
      }
    });
  }, [data, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleDeleteRequest = (id: number) => {
    const item = data.find(i => (activeTab === 'mapa' ? i.id_registro : i.id_grupo) === id);
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === 'mapa') {
        await visitorRepo.deleteRegistro(selectedItem.id_registro);
      } else {
        await eventRepo.deleteGrupoVisitante(selectedItem.id_grupo);
      }
      showToast('Registro eliminado correctamente', 'success');
      fetchData();
    } catch (err: any) {
      showToast('No se pudo eliminar el registro: ' + err.message, 'error');
    }
  };

  const handleEditRequest = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveQuantity = async (nuevaCantidad: number) => {
    if (!selectedItem) return;
    try {
      if (activeTab === 'mapa') {
        await visitorRepo.updateRegistro(selectedItem.id_registro, nuevaCantidad);
      } else {
        await eventRepo.updateGrupoVisitante(selectedItem.id_grupo, nuevaCantidad);
      }
      showToast('Registro actualizado correctamente', 'success');
      fetchData();
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast('No se pudo actualizar la cantidad: ' + err.message, 'error');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header*/}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Visitantes</h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold opacity-70">
            Control de flujo y actividad
          </p>
        </div>

        <div className="inline-flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'mapa'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Mapa
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'eventos'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Eventos
          </button>
        </div>
      </div>

      {/* Buscador y Filtro */}
      <div className="flex items-center gap-3 mb-8 max-w-md">
        <div className="relative flex-1 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar registro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-[3px] focus:outline-blue-500/10 focus:bg-white focus:border-blue-400 transition-all text-sm text-slate-700"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          disabled={loading}
          title="Actualizar"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Datos */}
      <div className="relative">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Cargando información...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 mb-8 animate-in shake duration-500">
            <AlertCircle size={24} />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'mapa' ? (
              <TablaRegistroMapa
                registros={paginatedData}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
              />
            ) : (
              <TablaRegistroEventos
                registros={paginatedData}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
              />
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 pb-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Mostrar siempre la primera, la última, la actual y una alrededor de la actual
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      // Puntos suspensivos
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalConfirmacion
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        titulo="¿Eliminar registro?"
        mensaje="Esta acción es permanente y no se podrá recuperar el registro de visitantes seleccionado."
        tipo="danger"
      />

      <ModalEditarCantidad
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveQuantity}
        cantidadActual={activeTab === 'mapa' ? selectedItem?.cantidad : selectedItem?.num_visitantes}
        titulo="Modificar cantidad"
      />

      {/* Toast Notification */}
      <Toast
        open={!!toast}
        mensaje={toast?.message || ''}
        tipo={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
