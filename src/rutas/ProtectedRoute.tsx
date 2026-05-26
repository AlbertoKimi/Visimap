import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";

/**
 * Componente enrutador que envuelve las rutas privadas (Dashboard).
 * Bloquea el acceso a usuarios no autenticados redirigiéndolos al login.
 * Muestra un spinner de carga mientras verifica el estado de la sesión.
 * @returns El componente de ruta protegida
 */
export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading, isCheckingProfile } = useAuthStore();

    // Mientras se valida el perfil tras un login (o restauración de sesión),
    // mostramos spinner para evitar renderizar el dashboard si el usuario
    // resulta estar desactivado o sin perfil válido en BD.
    if (isLoading || isCheckingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
