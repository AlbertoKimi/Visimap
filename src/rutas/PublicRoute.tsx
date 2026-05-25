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
    const { isAuthenticated, isLoading, isCheckingProfile } = useAuthStore();

    // Mientras se valida el perfil, NO redirigimos al dashboard aunque la sesión
    // de Supabase ya esté creada. Esto es lo que elimina el parpadeo cuando un
    // usuario desactivado se autentica con éxito en Auth pero la app va a
    // rechazarlo segundos después.
    if (isLoading || isCheckingProfile) {
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
