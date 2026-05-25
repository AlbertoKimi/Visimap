import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import { LazyMotion } from 'framer-motion';
import { LandingPage } from "@/pages/LandingPage";
import { lazy, Suspense } from 'react';

const loadFramerFeatures = () => import('framer-motion').then(res => res.domAnimation);

// Code-splitting extremo: diferimos incluso los formularios y el layout del panel de administración
const FormularioSesion = lazy(() => import("@/components/app/FormularioSesion").then(module => ({ default: module.FormularioSesion })));
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout").then(module => ({ default: module.DashboardLayout })));
const EstablecerContrasena = lazy(() => import("@/pages/EstablecerContrasena").then(module => ({ default: module.EstablecerContrasena })));

// Code-splitting (Lazy Loading) para no bloquear la carga inicial con componentes pesados
const MapaVisitantes = lazy(() => import("@/pages/MapaVisitantes").then(module => ({ default: module.MapaVisitantes })));
const VistaUsuarios = lazy(() => import("@/pages/VistaUsuarios").then(module => ({ default: module.VistaUsuarios })));
const VistaCalendario = lazy(() => import("@/pages/VistaCalendario").then(module => ({ default: module.VistaCalendario })));
const VistaPerfil = lazy(() => import("@/pages/VistaPerfil").then(module => ({ default: module.VistaPerfil })));
const Graficos = lazy(() => import("@/pages/Graficos").then(module => ({ default: module.Graficos })));
const RegistroVisitante = lazy(() => import("@/pages/RegistroVisitante").then(module => ({ default: module.RegistroVisitante })));
const Notas = lazy(() => import("@/pages/Notas").then(module => ({ default: module.Notas })));
const Asistente = lazy(() => import("@/pages/Asistente").then(module => ({ default: module.Asistente })));
const Historial = lazy(() => import("@/pages/Historial").then(module => ({ default: module.Historial })));
import { ProtectedRoute } from "@/rutas/ProtectedRoute";
import { PublicRoute } from "@/rutas/PublicRoute";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/database/supabase/client";
import { RepositoryFactory } from "@/database/RepositoryFactory";

import logoUrl from "@/assets/Logo-1-opt.webp";
import logoModoOscuroUrl from "@/assets/Logo-MO-opt.webp";

/**
 * Pantalla de carga global que se muestra mientras se verifica la sesión
 * o se descargan los fragmentos de código (Lazy Loading).
 */
const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="size-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando…</p>
    </div>
  </div>
);

/**
 * Componente Raíz de la Aplicación (Visimap).
 * Gestiona el Router principal de React Router DOM v6, la verificación inicial
 * de la sesión en Supabase y el estado de la aplicación.
 * Implementa Lazy Loading masivo para optimizar el bundle size inicial.
 * @returns El componente raíz de la aplicación
 */
export default function App() {
  const {
    session,
    isLoading,
    setSession,
    clearSession,
    userProfile,
    setUserProfile,
    setLoading
  } = useAuthStore();

  const isAdmin = userProfile?.role_id === 1;

  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Comprobación inicial de sesión
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        fetchProfile(initialSession.user.id);
      } else {
        clearSession();
      }
    });

    // Listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        fetchProfile(newSession.user.id);
      } else {
        clearSession();
      }
    });

    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
      setIsRecoveryMode(true);
    }

    // Corrección para el bug de desplazamiento del viewport en iOS Safari (cierre de teclado)
    // Cuando body es position:fixed, window.scrollY siempre es 0 — hay que usar visualViewport
    const resetIOSViewport = () => {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                    ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
      if (!isIOS) return;
      // Esperar a que el teclado se cierre completamente (~300ms en iOS)
      setTimeout(() => {
        // La API visualViewport es la única forma fiable de detectar y resetear el offset de iOS
        if (window.visualViewport) {
          const vv = window.visualViewport;
          // Si el viewport visual está desplazado hacia arriba, lo forzamos a volver
          if (vv.offsetTop !== 0 || vv.pageTop !== 0) {
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      }, 300);
    };
    const handleFocusOut = () => resetIOSViewport();
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.active === false) {
        supabase.auth.signOut();
        clearSession();
      } else {
        setUserProfile(profile);
      }
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const authRepo = RepositoryFactory.getAuthRepository();
    await authRepo.signIn(email, password);
  };

  const refreshProfileCallback = () => {
    const state = useAuthStore.getState();
    if (state.user) fetchProfile(state.user.id);
  };

  const router = createBrowserRouter([
    {
      element: <PublicRoute />,
      children: [
        {
          path: "/",
          element: <LandingPage onGetStarted={() => window.location.href = "/login"} />
        },
        {
          path: "/login",
          element: <FormularioSesion
            onLogin={handleLogin}
            onBack={() => window.location.href = "/"}
            logoUrl={logoUrl}
            logoModoOscuroUrl={logoModoOscuroUrl}
          />
        }
      ]
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/dashboard",
          element: isRecoveryMode && session ? (
            <EstablecerContrasena session={session} onComplete={() => setIsRecoveryMode(false)} />
          ) : (
            <DashboardLayout />
          ),
          children: [
            {
              index: true,
              element: <Navigate to="mapa" replace />
            },
            {
              path: "mapa",
              element: <MapaVisitantes onRegistrarVisitante={() => { }} />
            },
            {
              path: "registro-visitante",
              element: isAdmin ? <RegistroVisitante /> : <Navigate to="/dashboard/mapa" replace />
            },
            {
              path: "personal",
              element: <VistaUsuarios onRefreshProfile={refreshProfileCallback} />
            },
            {
              path: "eventos",
              element: <VistaCalendario />
            },
            {
              path: "estadisticas",
              element: isAdmin ? <Graficos /> : <Navigate to="/dashboard/mapa" replace />
            },
            {
              path: "notas",
              element: <Notas />
            },
            {
              path: "asistente",
              element: isAdmin ? <Asistente /> : <Navigate to="/dashboard/mapa" replace />
            },
            {
              path: "historial",
              element: isAdmin ? <Historial /> : <Navigate to="/dashboard/mapa" replace />
            },
            {
              path: "perfil",
              element: <VistaPerfil
                userProfile={useAuthStore.getState().userProfile}
                onRefreshProfile={refreshProfileCallback}
              />
            }
          ]
        }
      ]
    },
    {
      path: "*",
      element: <Navigate to={session ? "/dashboard" : "/"} replace />
    }
  ]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LazyMotion features={loadFramerFeatures} strict>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </LazyMotion>
  );
}
