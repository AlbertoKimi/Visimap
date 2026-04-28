import React, { useState } from 'react';
import Input from "@/components/ui/input";
import fondoLoginImg from "@/assets/Fondo_Login.webp";

interface FormularioSesionProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onBack: () => void;
  logoUrl?: string;
  logoModoOscuroUrl?: string;
}

export const FormularioSesion: React.FC<FormularioSesionProps> = ({
  onLogin,
  onBack,
  logoUrl,
  logoModoOscuroUrl
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState<Record<string, boolean>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

    if (Object.values(errorStatus).some(v => v)) {
      setSubmissionError('Por favor, corrige los errores en el formulario.');
      return;
    }

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setSubmissionError('Correo electrónico o contraseña incorrectos.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat transition-colors duration-300"
      style={{ backgroundImage: `url('${fondoLoginImg}')` }}
    >
      <div className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border dark:border-slate-800">
        <div className="justify-center text-center mb-8 space-y-4 items-center flex flex-col">
          {logoUrl && (
            <img
              src={theme === 'dark' ? (logoModoOscuroUrl || logoUrl) : logoUrl}
              alt="VisiMap Logo"
              className="w-32 h-32 object-contain transition-opacity duration-300"
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
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Acceso Personal</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Introduce tus credenciales para continuar</p>
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
            <p className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 animate-in shake-in duration-300">
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
          className="w-full text-slate-600 dark:text-slate-400 text-sm font-medium mt-6 hover:text-blue-700 dark:hover:text-blue-400 hover:underline transition-all duration-200"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};
