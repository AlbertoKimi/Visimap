import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LandingPage } from './components/LandingPage';
import { MapaVisitantes } from './components/MapaVisitantes';
import { VistaUsuarios } from './components/VistaUsuarios';
import { VistaCalendario } from './components/VistaCalendario';
import { VistaPerfil } from './components/VistaPerfil';
import { FormularioSesion } from './components/FormularioSesion';
import { MenuLateral } from './components/MenuLateral';
import { Bell } from 'lucide-react';

const supabaseUrl = "https://vpetkpmxeopozhqizsqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXRrcG14ZW9wb3pocWl6c3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MTUsImV4cCI6MjA3ODQ1MjQxNX0.sVooRLG4r_wd2cHNMCngTUPBWnCAVbCwoyibVjoWou8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const logoUrl = "/src/assets/Logo.png";

export default function App() {
  const [view, setView] = useState('landing');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardView, setDashboardView] = useState('map');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  // Dashboard principal con sesión activa
  if (session) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
        {/* MenuLateral */}
        <MenuLateral
          session={session}
          dashboardView={dashboardView}
          onViewChange={setDashboardView}
          onLogout={handleLogout}
          logoUrl={logoUrl}
        />

        {/* MAIN*/}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-center px-8 shadow-sm z-10">
            <h1 className="text-lg font-bold text-slate-700 capitalize">
              {dashboardView === 'map' && 'Mapa de Visitantes'}
              {dashboardView === 'workers' && 'Gestión de Personal'}
              {dashboardView === 'calendar' && 'Calendario de Eventos'}
              {dashboardView === 'profile' && 'Configuración de Perfil'}
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors absolute right-12">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>

          {/* Contenido dinámico según la vista */}
          <div className="flex-1 overflow-auto p-8 relative">
            {dashboardView === 'map' && (
              <MapaVisitantes onRegistrarVisitante={(data) => console.log(data)} />
            )}
            {dashboardView === 'workers' && <VistaUsuarios />}
            {dashboardView === 'calendar' && <VistaCalendario />}
            {dashboardView === 'profile' && <VistaPerfil session={session} />}
          </div>
        </main>
      </div>
    );
  }

  // Vista de Login
  if (view === 'login') {
    return (
      <FormularioSesion 
        onLogin={handleLogin}
        onBack={() => setView('landing')}
        logoUrl={logoUrl}
      />
    );
  }

  // Landing Page
  return <LandingPage onGetStarted={() => setView('login')} />;
}