import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { useAuthStore } from "@/stores/authStore";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Perfil } from "@/interfaces/Perfil";
import { Nota } from "@/interfaces/Nota";
import { Snackbar, Alert } from '@mui/material';
import { ModalConfirmacion } from '@/components/app/modales/ModalConfirmacion';

/**
 * Interfaz para las propiedades del componente NotaModal.
 */
interface NotaModalProps {
  /** Función para cerrar el modal. */
  onClose: () => void;
  /** Callback ejecutado tras crear o editar exitosamente una nota. */
  onNotaCreated: () => void;
  /** Nota opcional para editar. Si se proporciona, el modal estará en modo edición. */
  nota?: Nota;
}

/**
 * Componente Modal para la creación y edición de notas.
 * Permite definir un título, contenido y asignar la nota a "Todos" o a un usuario específico del equipo.
 * Carga dinámicamente la lista de usuarios activos para el desplegable de asignación.
 * @param props - Propiedades del modal (onClose, onNotaCreated, nota).
 */
export const NotaModal: React.FC<NotaModalProps> = ({ onClose, onNotaCreated, nota }) => {
  const [titulo, setTitulo] = useState(nota ? nota.titulo : '');
  const [contenido, setContenido] = useState(nota ? nota.contenido : '');
  const [asignadoA, setAsignadoA] = useState<string>(
    nota ? (nota.asignado_a || 'todos') : 'todos'
  );
  const [notificacion, setNotificacion] = useState<{
    open: boolean;
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    mensaje: '',
    tipo: 'success'
  });
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
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

  const handleCerrarNotificacion = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotificacion(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    setConfirmModal({
      open: true,
      title: nota ? '¿Guardar cambios?' : '¿Crear nota?',
      message: nota
        ? '¿Estás seguro de que quieres guardar los cambios realizados en esta nota?'
        : '¿Estás seguro de que quieres crear esta nueva nota?',
      onConfirm: executeSubmit
    });
  };

  const executeSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const repo = RepositoryFactory.getNotaRepository();

      const payload: any = {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
      };

      // Solamente pasamos asignado si es diferente de "todos" y diferente de vacio
      if (asignadoA && asignadoA !== 'todos') {
        payload.asignado_a = asignadoA;
      } else {
        payload.asignado_a = null;
      }

      if (nota) {
        // Modo edición
        await repo.updateNota(nota.id, payload);
      } else {
        // Modo creación
        payload.creado_por = user.id;
        await repo.createNota(payload);
      }
      onNotaCreated();
      onClose();
    } catch (error) {
      console.error(nota ? 'Error al actualizar nota:' : 'Error al crear nota:', error);
      setNotificacion({
        open: true,
        mensaje: nota ? 'No se pudo actualizar la nota. Comprueba tu conexión e inténtalo de nuevo.' : 'No se pudo crear la nota. Comprueba tu conexión e inténtalo de nuevo.',
        tipo: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={nota ? "Editar Nota" : "Añadir Nota"}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !titulo.trim() || !contenido.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-200/50 dark:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : (nota ? 'Guardar' : 'Aceptar')}
          </button>
        </>
      }
    >
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

      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={handleCerrarNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="z-[100]"
      >
        <Alert
          onClose={handleCerrarNotificacion}
          severity={notificacion.tipo}
          variant="filled"
          sx={{ width: '100%', minWidth: '300px', boxShadow: 4, fontSize: '0.95rem' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>

      {confirmModal && (
        <ModalConfirmacion
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          titulo={confirmModal.title}
          mensaje={confirmModal.message}
          tipo={nota ? 'success' : 'info'}
        />
      )}
    </Modal>
  );
};
