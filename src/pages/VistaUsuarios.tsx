import React, { useState, useEffect } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UsersTable } from "@/components/app/TablaUsuarios";
import { FormularioRegistroUsuario } from "@/components/app/FormularioRegistroEquipo";
import { DetalleUsuario } from './DetalleUsuarioView';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";

const userRepo = RepositoryFactory.getUserRepository();
const roleRepo = RepositoryFactory.getRoleRepository();

export const VistaUsuarios: React.FC<{ onRefreshProfile?: () => void }> = ({ onRefreshProfile }) => {
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

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const [profilesData, rolesData] = await Promise.all([
        userRepo.getAll(),
        roleRepo.getAll()
      ]);
      setProfiles(profilesData);
      setRoles(rolesData);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
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
    fetchProfiles();
    mostrarNotificacion('Usuario registrado correctamente', 'success');
  };

  const handleAction = async (action: string, user: Perfil) => {
    if (action === 'toggle_status') {
      const currentStatus = user.active !== false;
      const newStatus = !currentStatus;
      const actionVerb = newStatus ? 'activar' : 'desactivar';

      if (window.confirm(`¿Estás seguro de que deseas ${actionVerb} a ${user.nombre || 'este usuario'}?`)) {
        await handleToggleUserStatus(user, newStatus);
      }
      return;
    }

    setViewState({ mode: 'detail', selectedUser: user, initialMode: action });
  };

  const handleToggleUserStatus = async (user: Perfil, newStatus: boolean) => {
    try {
      await userRepo.toggleStatus(user.id, newStatus);
      mostrarNotificacion(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
      fetchProfiles();
      if (onRefreshProfile) onRefreshProfile();
    } catch (err: any) {
      console.error("Error al cambiar estado:", err);
      mostrarNotificacion('Error al cambiar estado: ' + err.message, 'error');
    }
  };

  const handleBack = () => {
    setViewState({ mode: 'list', selectedUser: null, initialMode: 'view' });
  };

  const handleUpdateSuccess = () => {
    fetchProfiles();
    if (onRefreshProfile) onRefreshProfile();
  };

  const handleDeactivateSelected = async (ids: string[]) => {
    if (!window.confirm(`¿Deseas marcar como inactivos a ${ids.length} usuario(s)?`)) return;
    try {
      await Promise.all(ids.map(id => userRepo.toggleStatus(id, false)));
      mostrarNotificacion(`${ids.length} usuario(s) marcados como inactivos`, 'success');
      fetchProfiles();
      if (onRefreshProfile) onRefreshProfile();
    } catch (err: any) {
      mostrarNotificacion('Error al cambiar estado: ' + err.message, 'error');
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
    <div className="h-full overflow-y-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pr-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Equipo de Trabajo</h2>
          <p className="text-slate-500">Gestiona los permisos y el personal del museo.</p>
        </div>

        <Button
          onClick={onAddUser}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Añadir Trabajador
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Nuevo Trabajador</h3>
                      <p className="text-sm text-blue-600 font-medium">Registro de personal</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <FormularioRegistroUsuario
                  onSuccess={handleRegisterSuccess}
                  onCancel={() => setShowForm(false)}
                  mostrarNotificacion={mostrarNotificacion}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
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
                onClick={fetchProfiles}
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
    </div>
  );
};
