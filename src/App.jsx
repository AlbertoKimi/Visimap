import React, { useState, useEffect } from 'react';
// Cambiamos el proveedor de CDN a esm.sh para mejorar la compatibilidad con el entorno de previsualización
// y evitar errores de "Dynamic require".
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// --- CONFIGURACIÓN DE CONEXIÓN ---
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
    // Comprobar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios de login/logout
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Cargando VisiMap...</p>
      </div>
    </div>
  );

  if (session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-6 max-w-lg w-full transform transition hover:scale-[1.01]">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200">
             <span className="text-white text-4xl font-black">V</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">¡Acceso Correcto!</h1>
          <p className="text-slate-500">Sesión iniciada como: <br/>
            <span className="font-bold text-indigo-600 break-all">{session.user.email}</span>
          </p>
          <div className="pt-4">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition duration-200 shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navegación Superior */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800 uppercase">VisiMap</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('landing')} className={`text-sm font-bold transition ${view === 'landing' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Inicio</button>
          <button onClick={() => setView('login')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Acceso</button>
        </div>
      </nav>

      {/* Contenido Dinámico */}
      <div className="relative">
        {view === 'landing' ? (
          <main className="max-w-7xl mx-auto px-8 pt-20 md:pt-32 text-center space-y-12 animate-in fade-in duration-700">
            <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">Proyecto Museo MUVI</div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none">
              Digitaliza el flujo <br />
              <span className="text-indigo-600">de visitantes.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed font-medium">
              Registra procedencias, analiza estadísticas y gestiona eventos en tiempo real para el Museo MUVI.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setView('login')} className="px-12 py-5 bg-slate-900 text-white rounded-[20px] font-bold text-lg hover:scale-105 transition shadow-2xl active:scale-95">
                Acceder al Sistema
              </button>
            </div>

            {/* Stats Mockup */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-16 opacity-60">
                {['Visitantes', 'Países', 'Aforo', 'Eventos'].map((item) => (
                    <div key={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition hover:shadow-md">
                        <p className="text-2xl font-black text-slate-800">--</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item}</p>
                    </div>
                ))}
            </div>
          </main>
        ) : (
          <div className="max-w-md mx-auto pt-20 px-8 animate-in slide-in-from-bottom duration-500 pb-20">
            <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl border border-slate-100 space-y-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Acceso Personal</h2>
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Email</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@muvi.es" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition text-lg"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Contraseña</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition text-lg"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 text-lg">
                  Iniciar Sesión
                </button>
              </form>
              <button onClick={() => setView('landing')} className="text-slate-400 text-sm font-medium hover:text-indigo-600 transition">
                ← Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation: fade-in 0.5s ease-out; }
        .slide-in-from-bottom { animation: slide-in-from-bottom 0.5s ease-out; }
      `}} />
    </div>
  );
}
