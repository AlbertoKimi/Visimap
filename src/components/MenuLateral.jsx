import { Map, Users, Calendar, UserCog, LogOut } from 'lucide-react';
import { Button } from './ui/button';

export const MenuLateral = ({ session, dashboardView, onViewChange, onLogout}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">

      {/*Información del usuario con la foto de perfil, nombre y rol */}

      <div className="p-3 border border-slate-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 px-2">
          <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
            {session?.user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden text-center">
            <p className="text-sm font-medium text-slate-700 truncate">
              {session?.user?.email}
            </p>
            <p className="text-xs text-slate-400 p-2">Administrador</p>
          </div>
        </div>
      </div>


      {/* Navegación */}
      <nav className="border-t-2 flex-1 p-4 space-y-1 overflow-y-auto">
        <ItemLateral
          icon={Map}
          label="Mapa Interactivo"
          active={dashboardView === 'map'}
          onClick={() => onViewChange('map')}
        />
        <ItemLateral
          icon={Users}
          label="Trabajadores"
          active={dashboardView === 'workers'}
          onClick={() => onViewChange('workers')}
        />
        <ItemLateral
          icon={Calendar}
          label="Eventos"
          active={dashboardView === 'calendar'}
          onClick={() => onViewChange('calendar')}
        />

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cuenta
          </p>
        </div>

        <ItemLateral
          icon={UserCog}
          label="Editar Perfil"
          active={dashboardView === 'profile'}
          onClick={() => onViewChange('profile')}
        />
      </nav>

      {/* Información usuario */}
      <div className="p-4">
        <Button
          onClick={onLogout}
          variant = "outline"
          size="lg"
          className="w-40 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};

// Componente para cada item del menú lateral
const ItemLateral = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
    {label}
  </button>
);