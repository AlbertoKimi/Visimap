import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Nota } from '../interfaces/Nota';
import { RepositoryFactory } from '../database/RepositoryFactory';
import { NotaCard } from '../components/notas/NotaCard';
import { NotaModal } from '../components/notas/NotaModal';
import { useAuthStore } from '../stores/authStore';

export const Notas: React.FC = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, userProfile } = useAuthStore();

  const loadNotas = async () => {
    setIsLoading(true);
    try {
      const repo = RepositoryFactory.getNotaRepository();
      const n = await repo.getNotasRecientes();

      const filteredNotas = n.filter(nota => {
        const isGlobal = !nota.asignado_a;
        if (isGlobal) return true;
        
        const isTarget = nota.asignado_a === userProfile?.id;
        const isCreator = nota.creado_por === userProfile?.id;
        const isAdmin = userProfile?.role_id === 1;
        
        return isTarget || isCreator || isAdmin;
      });

      setNotas(filteredNotas);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotas();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const notasNormales = notas.filter(n => n.estado === 'normal');
  const notasPendientes = notas.filter(n => n.estado === 'pendiente');
  const notasFinalizadas = notas.filter(n => n.estado === 'finalizada');

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 sm:p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Notas y Tareas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona tus recordatorios. Las tareas finalizadas duran 7 días.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          Añadir nota
        </button>
      </div>

      <div className="flex flex-col gap-8 pb-8">
        
        {/* Todas las Notas */}
        <section className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            Todas las Notas
            <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasNormales.length}
            </span>
          </h2>
          {notasNormales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-blue-200/50 rounded-xl bg-blue-50/50">
              <p className="text-blue-600/70 text-sm font-medium">No hay notas nuevas. Pulsa en "Añadir nota" para crear una.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 content-start auto-rows-max">
              {notasNormales.map(nota => (
                <NotaCard key={nota.id} nota={nota} onNotaUpdated={loadNotas} />
              ))}
            </div>
          )}
        </section>

        {/* Tareas Pendientes */}
        <section className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100/50">
          <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
            Tareas Pendientes
            <span className="bg-orange-100 text-orange-700 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasPendientes.length}
            </span>
          </h2>
          {notasPendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-orange-200/50 rounded-xl bg-orange-50/50">
              <p className="text-orange-600/70 text-sm font-medium">No hay ninguna tarea marcada como pendiente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 content-start auto-rows-max">
              {notasPendientes.map(nota => (
                <NotaCard key={nota.id} nota={nota} onNotaUpdated={loadNotas} />
              ))}
            </div>
          )}
        </section>

        {/* Tareas Finalizadas */}
        <section className="bg-green-50/30 p-5 rounded-2xl border border-green-100/50">
          <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
            Tareas Finalizadas
            <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasFinalizadas.length}
            </span>
          </h2>
          {notasFinalizadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-green-200/50 rounded-xl bg-green-50/50">
              <p className="text-green-600/70 text-sm font-medium">Aún no hay tareas finalizadas esta semana.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 content-start auto-rows-max">
              {notasFinalizadas.map(nota => (
                <NotaCard key={nota.id} nota={nota} onNotaUpdated={loadNotas} />
              ))}
            </div>
          )}
        </section>

      </div>

      {isModalOpen && (
        <NotaModal onClose={() => setIsModalOpen(false)} onNotaCreated={loadNotas} />
      )}
    </div>
  );
};
