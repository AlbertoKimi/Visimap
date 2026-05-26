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

    // En la carga inicial de la app sí mostramos spinner (todavía no sabemos si
    // hay sesión restaurada de localStorage).
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Si el usuario ya está autenticado Y el perfil ha sido validado (no
    // estamos en medio de un check) → al dashboard.
    //
    // Si la sesión está autenticada PERO `isCheckingProfile=true`, dejamos el
    // formulario de login a la vista. Así el banner rojo de
    // "cuenta desactivada" aparece directamente sobre el form.
    if (isAuthenticated && !isCheckingProfile) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
