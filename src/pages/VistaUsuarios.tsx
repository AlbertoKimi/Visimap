import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/Modal";
import { ModalConfirmacion } from "@/components/app/modales/ModalConfirmacion";
import { UsersTable } from "@/components/app/TablaUsuarios";
import { FormularioRegistroUsuario } from "@/components/app/FormularioRegistroEquipo";
import { DetalleUsuario } from './DetalleUsuarioView';
import { Snackbar, Alert } from '@mui/material';
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";
import { useAuthStore } from "@/stores/authStore";

const userRepo = RepositoryFactory.getUserRepository();
const roleRepo = RepositoryFactory.getRoleRepository();

/**
 * Vista de administración de usuarios (Solo accesible para Administradores).
 * 
 * Este componente es el panel principal de gestión del personal. Permite a los
 * administradores ver la lista de todos los usuarios registrados, crear nuevas
 * cuentas de trabajadores/administradores, y modificar el estado de las cuentas
 * existentes (activar/desactivar).
 * 
 * @param props - Propiedades del componente
 * @param props.onRefreshProfile - Callback opcional para refrescar los datos del perfil del usuario actual (útil si el admin modifica sus propios datos).
 */
export const VistaUsuarios: React.FC<{ onRefreshProfile?: () => void }> = ({ onRefreshProfile }) => {
  const { userProfile } = useAuthStore();
  const [profiles, setProfiles] = useState<Perfil[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<{
    mode: 'list' | 'detail';
    selectedUser: Perfil | null;
    initialMode: string;
  }>({ mode: 'list', selectedUser: null, initialMode: 'view' });

  const [confirmacion, setConfirmacion] = useState<{
    isOpen: boolean;
    user: Perfil | null;
    newStatus: boolean;
  }>({ isOpen: false, user: null, newStatus: false });

  const [notificacion, setNotificacion] = useState<{
    open: boolean;
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  const handleCerrarNotificacion = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotificacion({ ...notificacion, open: false });
  };

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const fetchProfiles = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [profilesData, rolesData] = await Promise.all([
        userRepo.getAll(),
        roleRepo.getAll()
      ]);
      setProfiles(profilesData);
      setRoles(rolesData);
    } catch (error) {
      const err = error as Error;
      console.error('Error cargando usuarios:', err.message);
      setError('No se ha podido cargar el equipo. Por favor, comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const onAddUser = () => {
    setShowForm(true);
  };

  const handleRegisterSuccess = () => {
    setShowForm(false);
    fetchProfiles(false);
    mostrarNotificacion('Usuario registrado correctamente', 'success');
    if (onRefreshProfile) onRefreshProfile();
  };

  const handleAction = async (action: string, user: Perfil) => {
    // Bloquear cualquier acción sobre la propia cuenta
    if (user.id === userProfile?.id) return;

    if (action === 'toggle_status') {
      const currentStatus = user.active !== false;
      const newStatus = !currentStatus;
      
      setConfirmacion({
        isOpen: true,
        user,
        newStatus
      });
      return;
    }

    setViewState({ mode: 'detail', selectedUser: user, initialMode: action });
  };

  const handleToggleUserStatus = async (user: Perfil, newStatus: boolean) => {
    try {
      await userRepo.toggleStatus(user.id, newStatus);
      mostrarNotificacion(`Usuario ${newStatus ? 'activado' : 'inactivo'} correctamente`, 'success');
      fetchProfiles(false);
      if (onRefreshProfile) onRefreshProfile();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      mostrarNotificacion('No se pudo cambiar el estado del usuario. Inténtalo de nuevo.', 'error');
    }
  };

  const handleBack = () => {
    setViewState({ mode: 'list', selectedUser: null, initialMode: 'view' });
  };



  const handleUpdateSuccess = () => {
    fetchProfiles(false);
    if (onRefreshProfile) onRefreshProfile();
  };

  const handleDeactivateSelected = async (ids: string[]) => {
    // Evitar que el usuario se inactivee a sí mismo
    const safeIds = ids.filter(id => id !== userProfile?.id);

    if (safeIds.length === 0) {
      mostrarNotificacion('No puedes inactivarte a ti mismo.', 'warning');
      return;
    }

    try {
      await Promise.all(safeIds.map(id => userRepo.toggleStatus(id, false)));
      mostrarNotificacion(`${safeIds.length} usuario(s) marcados como inactivos`, 'success');
      fetchProfiles(false);
      if (onRefreshProfile) onRefreshProfile();
    } catch (error) {
      mostrarNotificacion('No se pudo cambiar el estado de algunos usuarios. Inténtalo de nuevo.', 'error');
    }
  };

  const handleActivateSelected = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => userRepo.toggleStatus(id, true)));
      mostrarNotificacion(`${ids.length} usuario(s) marcados como activos`, 'success');
      fetchProfiles(false);
      if (onRefreshProfile) onRefreshProfile();
    } catch (error) {
      mostrarNotificacion('No se pudo cambiar el estado de algunos usuarios. Inténtalo de nuevo.', 'error');
    }
  };

  if (viewState.mode === 'detail' && viewState.selectedUser) {
    const currentUser = profiles.find(p => p.id === viewState.selectedUser?.id) || viewState.selectedUser;

    return (
      <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-500 pr-2">
        <DetalleUsuario
          user={currentUser}
          initialMode={viewState.initialMode}
          roles={roles}
          onBack={handleBack}
          onUpdate={handleUpdateSuccess}
          mostrarNotificacion={mostrarNotificacion}
        />
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Equipo de Trabajo</h1>
          <p className="page-subtitle">
            Gestiona los permisos y el personal del museo
          </p>
        </div>

        <Button
          onClick={onAddUser}
          className="bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm font-medium h-10 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="text-sm">Añadir Trabajador</span>
        </Button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        size="md"
        title={
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Trabajador</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Registro de personal</p>
          </div>
        }
      >
        <FormularioRegistroUsuario
          onSuccess={handleRegisterSuccess}
          onCancel={() => setShowForm(false)}
          mostrarNotificacion={mostrarNotificacion}
        />
      </Modal>

      <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Cargando equipo...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 bg-red-50">
              <p>Ocurrió un error al cargar los usuarios: {error}</p>
              <button
                onClick={() => fetchProfiles()}
                className="mt-4 text-sm underline hover:text-red-700"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <UsersTable
              users={profiles}
              roles={roles}
              onAction={handleAction}
              onDeactivateSelected={handleDeactivateSelected}
              onActivateSelected={handleActivateSelected}
              currentUserId={userProfile?.id}
            />
          )}
        </CardContent>
      </Card>

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
          sx={{
            width: '100%',
            minWidth: '300px',
            boxShadow: 4,
            fontSize: '0.95rem'
          }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>

      <ModalConfirmacion
        isOpen={confirmacion.isOpen}
        onClose={() => setConfirmacion({ ...confirmacion, isOpen: false })}
        onConfirm={() => {
          if (confirmacion.user) {
            handleToggleUserStatus(confirmacion.user, confirmacion.newStatus);
          }
        }}
        titulo={confirmacion.newStatus ? 'Activar Trabajador' : 'Desactivar Trabajador'}
        mensaje={`¿Estás seguro de que deseas ${confirmacion.newStatus ? 'activar' : 'desactivar'} a ${confirmacion.user?.nombre || 'este usuario'}?`}
        tipo={confirmacion.newStatus ? "success" : "danger"}
      />
    </div>
  );
};
