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
    setLoading,
    setCheckingProfile,
    setAuthError
  } = useAuthStore();

  const isAdmin = userProfile?.role_id === 1;

  // Capturamos el tipo del enlace del correo INMEDIATAMENTE al montar el
  // componente (función lazy del useState). Supabase JS limpia el hash en
  // cuanto procesa la sesión, así que si esperáramos a un useEffect el hash
  // ya podría haber desaparecido y perderíamos la distinción invite/recovery.
  const [recoveryType] = useState<'recovery' | 'invite' | null>(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) return 'recovery';
    if (hash.includes('type=invite')) return 'invite';
    return null;
  });
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => recoveryType !== null);

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
    // Marcamos que estamos validando el perfil. Las rutas (Protected/Public)
    // mostrarán un spinner durante este intervalo en vez de redirigir, evitando
    // el "parpadeo" del dashboard cuando un usuario desactivado intenta entrar.
    setCheckingProfile(true);
    try {
      // .maybeSingle() devuelve null cuando no encuentra fila, en lugar de lanzar
      // un 406 como hace .single(). Permite distinguir limpiamente "no hay perfil"
      // de "el perfil existe pero está inactivo".
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Caso A: error inesperado de red o BD (típicamente JWT caducado tras una
      // sesión muy antigua) → cerramos sesión silenciosamente y dejamos volver a entrar.
      if (error) {
        console.error('Error al cargar perfil:', error);
        await supabase.auth.signOut();
        clearSession();
        setAuthError('No se pudo cargar tu perfil. Vuelve a iniciar sesión.');
        return;
      }

      // Caso B: el usuario existe en auth.users pero no tiene fila en profiles.
      // Suele indicar un alta a medias o un perfil borrado a mano.
      if (!profile) {
        await supabase.auth.signOut();
        clearSession();
        setAuthError('No se encontró tu perfil en el sistema. Contacta con un administrador.');
        return;
      }

      // Caso C: el perfil existe pero está desactivado.
      if (profile.active === false) {
        await supabase.auth.signOut();
        clearSession();
        setAuthError('Tu cuenta está desactivada. Contacta con un administrador para reactivarla.');
        return;
      }

      // Caso D: todo OK, perfil válido y activo.
      setAuthError(null);
      setUserProfile(profile);
    } finally {
      setCheckingProfile(false);
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
            <EstablecerContrasena
              session={session}
              mode={recoveryType ?? 'invite'}
              onComplete={() => setIsRecoveryMode(false)}
            />
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
