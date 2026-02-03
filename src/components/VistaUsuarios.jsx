import { Plus, Loader2, X, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { UsersTable } from './TablaUsuarios';
import { supabase } from '../lib/supabaseClient';
import { FormularioRegistroUsuario } from './FormularioRegistro';
import { DetalleUsuario } from './DetalleUsuario';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

export const VistaUsuarios = () => {

  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState({ mode: 'list', selectedUser: null, initialMode: 'view' });

  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  const handleCerrarNotificacion = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotificacion({ ...notificacion, open: false });
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) throw rolesError;

      setProfiles(data || []);
      setRoles(rolesData || []);
    } catch (err) {
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
  };

  const handleAction = async (action, user) => {
    if (action === 'toggle_status') {
      const currentStatus = user.active !== false; // Default to true if undefined
      const newStatus = !currentStatus;
      const actionVerb = newStatus ? 'activar' : 'desactivar';

      // Simple confirmation
      if (window.confirm(`¿Estás seguro de que deseas ${actionVerb} a ${user.nombre || 'este usuario'}?`)) {
        await handleToggleUserStatus(user, newStatus);
      }
      return;
    }
    // view or edit
    setViewState({ mode: 'detail', selectedUser: user, initialMode: action });
  };

  const handleToggleUserStatus = async (user, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      mostrarNotificacion(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
      fetchProfiles();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      mostrarNotificacion('Error al cambiar estado: ' + err.message, 'error');
    }
  };

  const handleBack = () => {
    setViewState({ mode: 'list', selectedUser: null, initialMode: 'view' });
  };

  const handleUpdateSuccess = () => {
    fetchProfiles();
    // Optionally stay in view mode or go back? Usually stay in view mode to see changes.
    // But we need to update the selectedUser object with new data if we stay.
    // For now, let's go back to list or just re-fetch and keep selectedUser updated
    // A simple approach: reload profiles and find the user again, or just go back to list.
    // Let's go refresh data and current user.
    fetchProfiles().then(() => {
      // We'll rely on the DetalleUsuario to switch to view mode.
      // But we might need to update reference to selectedUser if we want to show updated data.
      // Actually, DetalleUsuario uses internal state initialized from props.
      // If we re-render DetalleUsuario with new props (from new profiles list), it works if we update selectedUser.
    });
  };

  // If in Detail Mode
  if (viewState.mode === 'detail' && viewState.selectedUser) {
    // Find the most up to date user object from profiles list to pass down
    const currentUser = profiles.find(p => p.id === viewState.selectedUser.id) || viewState.selectedUser;

    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-500">
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">


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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Nuevo Trabajador</h3>
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

          {/* Tabla: si carga o no los usuarios */}

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

            <UsersTable users={profiles} roles={roles} onAction={handleAction} />
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