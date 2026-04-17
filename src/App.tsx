import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import { LandingPage } from "@/pages/LandingPage";
import { MapaVisitantes } from "@/pages/MapaVisitantes";
import { VistaUsuarios } from "@/pages/VistaUsuarios";
import { VistaCalendario } from "@/pages/VistaCalendario";
import { VistaPerfil } from "@/pages/VistaPerfil";
import { Graficos } from "@/pages/Graficos";
import { RegistroVisitante } from "@/pages/RegistroVisitante";
import { Notas } from "@/pages/Notas";
import { FormularioSesion } from "@/components/app/FormularioSesion";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/rutas/ProtectedRoute";
import { PublicRoute } from "@/rutas/PublicRoute";
import { EstablecerContrasena } from "@/pages/EstablecerContrasena";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/database/supabase/client";
import { RepositoryFactory } from "@/database/RepositoryFactory";

const logoUrl = "/src/assets/Logo-1.webp";

export default function App() {
  const {
    session,
    isLoading,
    setSession,
    clearSession,
    setUserProfile,
    setLoading
  } = useAuthStore();

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

    return () => {
      subscription.unsubscribe();
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
              element: <RegistroVisitante />
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
              element: <Graficos />
            },
            {
              path: "notas",
              element: <Notas />
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
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Iniciando Visimap...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
