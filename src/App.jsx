import React, { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { LandingPage } from './components/LandingPage';

const supabaseUrl = "https://vpetkpmxeopozhqizsqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXRrcG14ZW9wb3pocWl6c3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MTUsImV4cCI6MjA3ODQ1MjQxNX0.sVooRLG4r_wd2cHNMCngTUPBWnCAVbCwoyibVjoWou8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('landing');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

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

  if (session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center space-y-6 max-w-lg w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl font-black">V</span>
          </div>
          <h1 className="text-3xl font-bold">¡Acceso Correcto!</h1>
          <p className="text-slate-600">
            Sesión iniciada como: <br/>
            <span className="font-bold text-blue-600">{session.user.email}</span>
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} />;
  }

  // Vista de Login
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Acceso Personal</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600 uppercase">Email</label>
            <input 
              type="email" 
              className="w-full p-4 border rounded-xl"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 uppercase">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-4 border rounded-xl"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold">
            Iniciar Sesión
          </button>
        </form>
        <button 
          onClick={() => setView('landing')} 
          className="mt-4 text-slate-600 hover:text-blue-600"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}