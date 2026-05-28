import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";

/**
 * Componente enrutador que envuelve las rutas públicas (Landing, Login).
 * Si el usuario ya está autenticado, lo redirige automáticamente al Dashboard
 * para evitar que vea pantallas de inicio de sesión innecesariamente.
 * @returns El componente de ruta pública
 */
export const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading, userProfile } = useAuthStore();
    const location = useLocation();

    // Detectar si la URL trae los markers de Supabase Auth para recovery
    // o invite. En esos casos no queremos enseñar la landing — vienen de un
    // correo y deben acabar en la pantalla de establecer contraseña.
    // (Supabase a veces limpia el hash automáticamente al crear la sesión,
    //  por eso también nos apoyamos en el path actual abajo.)
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const esRecuperacionOInvitacion =
        hash.includes('type=recovery') || hash.includes('type=invite');

    // El path "/" es la landing; "/login" es el formulario de sesión.
    // Solo queremos mantener el formulario visible durante validaciones
    // cuando el usuario está EN el login (caso del usuario desactivado).
    const estaEnLogin = location.pathname === '/login';

    // 1. Carga inicial de la app: aún no sabemos si hay sesión restaurada.
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 2. Sesión válida + perfil ya cargado (típicamente restaurada desde
    //    localStorage tras cerrar la pestaña) → al dashboard sin esperar
    //    a re-validaciones silenciosas.
    if (isAuthenticated && userProfile) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Sesión iniciándose pero sin perfil aún. Hay dos sub-casos:
    //    a) Estamos en /login → es un login fresco. Mantenemos el formulario
    //       visible para que el banner rojo (usuario desactivado, perfil no
    //       encontrado, etc.) aparezca sobre él sin parpadeo.
    //    b) Estamos en /     → o viene de un correo de invitación/recovery,
    //       o es una sesión recién creada por Supabase via URL fragment.
    //       Mostramos spinner para no enseñar la landing antes de redirigir.
    if (isAuthenticated && !estaEnLogin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 4. Cobertura adicional: si la URL contiene markers de invite/recovery
    //    aunque isAuthenticated aún no esté a true (la sesión está a medio
    //    construirse), tampoco enseñamos la landing.
    if (esRecuperacionOInvitacion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 5. Resto de casos (visita anónima sin sesión, login con perfil aún sin
    //    validar) → renderizar el formulario / landing tal cual.
    return <Outlet />;
};
