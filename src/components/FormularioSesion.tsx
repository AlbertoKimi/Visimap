import React, { useState } from 'react';
import Input from './inputs/Input';

interface FormularioSesionProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onBack: () => void;
  logoUrl?: string;
}

export const FormularioSesion: React.FC<FormularioSesionProps> = ({ 
    onLogin, 
    onBack, 
    logoUrl 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<Record<string, boolean>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const manejarCambioEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const manejarCambioPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const manejarError = (name: string, hasError: boolean) => {
    setErrorStatus(prev => ({ ...prev, [name]: hasError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    // Verificación final antes de enviar
    if (Object.values(errorStatus).some(v => v)) {
      setSubmissionError('Por favor, corrige los errores en el formulario.');
      return;
    }

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setSubmissionError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="justify-center text-center mb-8 space-y-4 items-center flex flex-col">
          {logoUrl && (
            <img
                src={logoUrl}
                alt="VisiMap Logo"
                className="w-32 h-32 object-contain"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = "w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg";
                      fallback.innerText = "V";
                      parent.prepend(fallback);
                  }
                }}
            />
          )}
          <h2 className="text-3xl font-bold text-slate-800">Acceso Personal</h2>
          <p className="text-slate-500 mt-2">Introduce tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            name="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            placeholder="ejemplo@muvi.es"
            required
            regex={/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/}
            error="Introduce un email válido (ej: usuario@empresa.com)"
            manejarCambio={manejarCambioEmail}
            manejarError={manejarError}
          />

          <Input
            name="password"
            label="Contraseña"
            type="password"
            value={password}
            placeholder="••••••••"
            required
            error="La contraseña es obligatoria"
            manejarCambio={manejarCambioPassword}
            manejarError={manejarError}
          />

          {submissionError && (
            <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake-in duration-300">
              {submissionError}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </form>
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
