import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { RepositoryFactory } from '@/database/RepositoryFactory';
import { TablaRegistroMapa } from '@/components/app/TablaRegistroMapa';
import { TablaRegistroEventos } from '@/components/app/TablaRegistroEventos';
import { ModalConfirmacion } from '@/components/app/modales/ModalConfirmacion';
import { ModalEditarCantidad } from '@/components/app/modales/ModalEditarCantidad';
import { ModalDetalleRegistro } from '@/components/app/modales/ModalDetalleRegistro';
import { Toast } from '@/components/ui/Toast';

export const RegistroVisitante: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mapa' | 'eventos'>('mapa');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
      setError('No se han podido cargar los datos. Por favor, comprueba tu conexión e inténtalo de nuevo.');
      showToast('No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
  };

  // ── Borrado individual (abre modal de confirmación) ──
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
      showToast('No se pudo eliminar el registro. Es posible que ya haya sido eliminado o no tengas permisos suficientes.', 'error');
    }
  };

  // ── Borrado masivo desde el checkbox ──
  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (!window.confirm(`¿Eliminar ${ids.length} registro(s) seleccionado(s)? Esta acción es permanente.`)) return;
    try {
      if (activeTab === 'mapa') {
        await Promise.all(ids.map(id => visitorRepo.deleteRegistro(Number(id))));
      } else {
        await Promise.all(ids.map(id => eventRepo.deleteGrupoVisitante(Number(id))));
      }
      showToast(`${ids.length} registro(s) eliminados correctamente`, 'success');
      fetchData();
    } catch (err: any) {
      showToast('No se pudieron eliminar algunos registros. Es posible que ya hayan sido eliminados o no tengas permisos suficientes.', 'error');
    }
  };

  // ── Edición ──
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
      showToast('No se pudo actualizar la cantidad. El registro puede haber sido eliminado o no tienes permisos para modificarlo.', 'error');
    }
  };

  // ── Detalle ──
  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Registro de Visitantes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold opacity-70">
            Control de flujo y actividad
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón refrescar */}
          <button
            onClick={fetchData}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            disabled={loading}
            title="Actualizar"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Pestañas */}
          <div className="inline-flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'mapa'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setActiveTab('eventos')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'eventos'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Eventos
            </button>
          </div>
        </div>
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
          <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 mb-8">
            <AlertCircle size={24} />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'mapa' ? (
              <TablaRegistroMapa
                registros={data}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
                onDeleteSelected={handleDeleteSelected}
                onRowClick={handleRowClick}
              />
            ) : (
              <TablaRegistroEventos
                registros={data}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
                onDeleteSelected={handleDeleteSelected}
                onRowClick={handleRowClick}
              />
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
        cantidadActual={(activeTab === 'mapa' ? selectedItem?.cantidad : selectedItem?.num_visitantes) || 0}
        titulo="Modificar cantidad"
      />

      <ModalDetalleRegistro
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedItem}
        tipo={activeTab}
      />

      {/* Toast */}
      <Toast
        open={!!toast}
        mensaje={toast?.message || ''}
        tipo={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
