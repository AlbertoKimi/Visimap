import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MenuLateral } from '../components/MenuLateral';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const DashboardLayout: React.FC = () => {
    const { userProfile } = useAuthStore();
    const location = useLocation();

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('mapa')) return 'Mapa de Visitantes';
        if (path.includes('registro-visitante')) return 'Registro de Visitantes';
        if (path.includes('personal')) return 'Gestión de Personal';
        if (path.includes('eventos')) return 'Calendario de Eventos';
        if (path.includes('estadisticas')) return 'Gráficos Estadísticos';
        if (path.includes('notas')) return 'Notas y Tareas';
        if (path.includes('perfil')) return 'Configuración de Perfil';
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            <MenuLateral userProfile={userProfile} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <h1 className="text-lg font-bold text-slate-700 capitalize">
                        {getTitle()}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden p-6 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
