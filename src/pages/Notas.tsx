import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Nota } from "@/interfaces/Nota";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { NotaCard } from "@/components/app/notas/NotaCard";
import { NotaModal } from "@/components/app/notas/NotaModal";
import { useAuthStore } from "@/stores/authStore";

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
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notas y Tareas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold opacity-70">
            Gestiona tus recordatorios y tareas del museo
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          <span className="text-sm">Añadir nota</span>
        </button>
      </div>

      <div className="flex flex-col gap-8 pb-8">
        
        {/* Todas las Notas */}
        <section className="bg-blue-50/30 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
            Todas las Notas
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasNormales.length}
            </span>
          </h2>
          {notasNormales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-blue-200/50 dark:border-blue-900/20 rounded-xl bg-blue-50/50 dark:bg-blue-900/5">
              <p className="text-blue-600/70 dark:text-slate-400 text-sm font-medium">No hay notas nuevas. Pulsa en "Añadir nota" para crear una.</p>
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
        <section className="bg-orange-50/30 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100/50 dark:border-orange-900/30">
          <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-400 mb-4 flex items-center gap-2">
            Tareas Pendientes
            <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasPendientes.length}
            </span>
          </h2>
          {notasPendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-orange-200/50 dark:border-orange-900/20 rounded-xl bg-orange-50/50 dark:bg-orange-900/5">
              <p className="text-orange-600/70 dark:text-slate-400 text-sm font-medium">No hay ninguna tarea marcada como pendiente.</p>
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
        <section className="bg-green-50/30 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100/50 dark:border-green-900/30">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-4 flex items-center gap-2">
            Tareas Finalizadas
            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs py-0.5 px-2.5 rounded-full font-bold">
              {notasFinalizadas.length}
            </span>
          </h2>
          {notasFinalizadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-green-200/50 dark:border-green-900/20 rounded-xl bg-green-50/50 dark:bg-green-900/5">
              <p className="text-green-600/70 dark:text-slate-400 text-sm font-medium">Aún no hay tareas finalizadas esta semana.</p>
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
