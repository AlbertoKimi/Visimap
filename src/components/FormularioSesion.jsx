import { useState } from 'react';
import { InputField } from './InputField';

export const FormularioSesion = ({ onLogin, onBack, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="justify-center text-center mb-8 space-y-4 items-center flex flex-col">
          <img
            src={logoUrl}
            alt="VisiMap Logo"
            className="w-24 h-24 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = "w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg";
              fallback.innerText = "V";
              e.target.parentNode.prepend(fallback);
            }}
          />
          <h2 className="text-3xl font-bold text-slate-800">Acceso Personal</h2>
          <p className="text-slate-500 mt-2">Introduce tus credenciales para continuar</p>
        </div>

        <div className="space-y-5">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@muvi.es"
            required
            labelClassName="text-slate-500 ml-1"
            className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500"
          />

          <InputField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            labelClassName="text-slate-500 ml-1"
            className="p-3 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500"
          />

          {error && (
            <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </div>
        <button
          onClick={onBack}
          className="w-full text-slate-400 text-sm font-medium mt-6 hover:text-blue-600 transition-colors"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};