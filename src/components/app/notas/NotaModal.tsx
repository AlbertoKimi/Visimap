import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { useAuthStore } from "@/stores/authStore";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Perfil } from "@/interfaces/Perfil";

interface NotaModalProps {
  onClose: () => void;
  onNotaCreated: () => void;
}

export const NotaModal: React.FC<NotaModalProps> = ({ onClose, onNotaCreated }) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [asignadoA, setAsignadoA] = useState('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const userRepo = RepositoryFactory.getUserRepository();
        const users = await userRepo.getAll();
        // Filtramos para quitar al usuario actual y obtener solo a los activos
        setUsuarios(users.filter(u => u.active && u.id !== user?.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    if (user) fetchUsuarios();
  }, [user]);

  const selectOptions = [
    { value: 'todos', label: 'Para todos (General)' },
    ...usuarios.map(u => ({
      value: u.id,
      label: `${u.nombre} ${u.primer_apellido}`
    }))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !titulo.trim() || !contenido.trim()) return;

    setIsSubmitting(true);
    try {
      const repo = RepositoryFactory.getNotaRepository();

      const payload: any = {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        creado_por: user.id,
      };

      // Solamente pasamos asignado si es diferente de "todos" y diferente de vacio
      if (asignadoA && asignadoA !== 'todos') {
        payload.asignado_a = asignadoA;
      } else {
        payload.asignado_a = null;
      }

      await repo.createNota(payload);
      onNotaCreated();
      onClose();
    } catch (error) {
      console.error('Error al crear nota:', error);
      alert('Hubo un error al crear la nota');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Añadir Nota</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="nota-form" onSubmit={handleSubmit} className="space-y-4">
            <Select
              name="asignado_a"
              label="Para"
              value={asignadoA}
              options={selectOptions}
              manejarCambio={(e) => setAsignadoA(e.target.value)}
            />
            <Input
              name="titulo"
              label="Título"
              value={titulo}
              manejarCambio={(e) => setTitulo(e.target.value)}
              placeholder="Título de la nota..."
              required
            />
            <TextArea
              name="contenido"
              label="Contenido"
              value={contenido}
              manejarCambio={(e) => setContenido(e.target.value)}
              placeholder="Escribe los detalles aquí..."
              required
            />
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nota-form"
            disabled={isSubmitting || !titulo.trim() || !contenido.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-200/50 dark:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
