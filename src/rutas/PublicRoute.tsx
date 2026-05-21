import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";

/**
 * Componente enrutador que envuelve las rutas públicas (Landing, Login).
 * Si el usuario ya está autenticado, lo redirige automáticamente al Dashboard
 * para evitar que vea pantallas de inicio de sesión innecesariamente.
 * @returns El componente de ruta pública
 */
export const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
