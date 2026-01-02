import React, { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { LandingPage } from './components/LandingPage';
import { MapaVisitantes } from './components/MapaVisitantes';

const supabaseUrl = "https://vpetkpmxeopozhqizsqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXRrcG14ZW9wb3pocWl6c3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MTUsImV4cCI6MjA3ODQ1MjQxNX0.sVooRLG4r_wd2cHNMCngTUPBWnCAVbCwoyibVjoWou8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'dashboard'
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        setView('dashboard'); // Si hay sesión, ir al dashboard
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Credenciales incorrectas');
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleRegistrarVisitante = async (datos) => {
    try {
      const { data, error } = await supabase
        .from('visitantes')
        .insert([{
          comunidad_autonoma: datos.comunidad,
          tipo_visita: datos.tipoVisita,
          num_personas: datos.numPersonas,
          pais: datos.pais,
          observaciones: datos.observaciones,
          fecha: datos.fecha,
        }]);

      if (error) throw error;
      
      console.log('✅ Visitante registrado:', data);
    } catch (error) {
      console.error('Error al registrar:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando VisiMap...</p>
        </div>
      </div>
    );
  }

  // DASHBOARD - Cuando el usuario está logueado
  if (session && view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header del Dashboard */}
        <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">VisiMap</h1>
                <p className="text-xs text-gray-600">Museo MUVI - Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                👤 <span className="font-semibold">{session.user.email}</span>
              </p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Registro de Visitantes</h2>
            <p className="text-gray-600">Gestión digital del Museo MUVI</p>
          </div>

          {/* Componente del Mapa */}
          <MapaVisitantes onRegistrarVisitante={handleRegistrarVisitante} />

          {/* Aquí podrás añadir más componentes: estadísticas, tablas, etc. */}
        </main>
      </div>
    );
  }

  // LANDING PAGE
  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} />;
  }

  // VISTA DE LOGIN
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Acceso Personal</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600 uppercase block mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 uppercase block mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition">
            Iniciar Sesión
          </button>
        </form>
        <button 
          onClick={() => setView('landing')} 
          className="mt-4 text-slate-600 hover:text-blue-600 transition w-full text-center"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}