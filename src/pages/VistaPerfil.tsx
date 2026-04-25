import React, { useState, useEffect } from 'react';
import { DetalleUsuario } from './DetalleUsuarioView';
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Snackbar, Alert } from '@mui/material';
import { Loader2 } from 'lucide-react';

const roleRepo = RepositoryFactory.getRoleRepository();

interface VistaPerfilProps {
  userProfile: Perfil | null;
  onRefreshProfile?: () => void;
}

export const VistaPerfil: React.FC<VistaPerfilProps> = ({ userProfile, onRefreshProfile }) => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificacion, setNotificacion] = useState<{
    open: boolean;
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await roleRepo.getAll();
        setRoles(rolesData);
      } catch (err) {
        console.error("Error al cargar roles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const handleCerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, open: false }));
  };

  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pr-2">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Mi Perfil</h2>
        <p className="text-slate-500 dark:text-slate-400">Administra tu información personal y visualiza tu actividad.</p>
      </div>

      <DetalleUsuario
        user={userProfile}
        roles={roles}
        onBack={() => { }}
        onUpdate={() => onRefreshProfile?.()}
        mostrarNotificacion={mostrarNotificacion}
        hideBack={true}
      // showDangerZone={false}
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
          sx={{ width: '100%', minWidth: '300px', boxShadow: 4 }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
};
