import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from './button';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../supabase/client';
import { Perfil } from '../interfaces/Perfil';

interface MenuLateralProps {
  userProfile: Perfil | null;
  logoUrl?: string;
}

export const MenuLateral: React.FC<MenuLateralProps> = ({
  userProfile
}) => {
  const { clearSession } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearSession();
  };

  const isAdmin = userProfile?.role_id === 1;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
      {/* Información del usuario */}
      <div className="p-3 border border-slate-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 px-2">
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt="Avatar"
              className="size-24 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold font-sans">
              {userProfile?.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="overflow-hidden text-center">
            <p className="text-sm font-medium text-slate-700 truncate">
              {userProfile?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 p-2">
              {isAdmin ? 'Administrador' : 'Trabajador'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="border-t-2 flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard/mapa" className={navLinkClasses}>
          Mapa Interactivo
        </NavLink>
        
        {isAdmin && (
          <NavLink to="/dashboard/registro-visitante" className={navLinkClasses}>
            Registro Visitante
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/dashboard/personal" className={navLinkClasses}>
            Trabajadores
          </NavLink>
        )}

        <NavLink to="/dashboard/eventos" className={navLinkClasses}>
          Eventos
        </NavLink>

        {isAdmin && (
          <NavLink to="/dashboard/estadisticas" className={navLinkClasses}>
            Gráficas
          </NavLink>
        )}

        <NavLink to="/dashboard/notas" className={navLinkClasses}>
          Notas
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cuenta
          </p>
        </div>

        <NavLink to="/dashboard/perfil" className={navLinkClasses}>
          Editar Perfil
        </NavLink>
      </nav>

      {/* Información usuario */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="w-40 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};
