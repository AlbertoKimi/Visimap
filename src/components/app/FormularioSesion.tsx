import React, { useState, useRef } from 'react';
import Input from "@/components/ui/input";
import fondoLoginImg from "@/assets/Fondo_Login.webp";
import { FormularioSesionProps } from "@/interfaces/components";

/**
 * Componente de Formulario de Inicio de Sesión.
 * Renderiza la interfaz de acceso con campos de email y contraseña,
 * validaciones en tiempo real y soporte para cambio de tema (claro/oscuro)
 * reflejado en el logo.
 * @param props - Manejadores de login/vuelta atrás y URLs de branding.
 */
export const FormularioSesion: React.FC<FormularioSesionProps> = ({
  onLogin,
  onBack,
  logoUrl,
  logoModoOscuroUrl
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const errorStatus = useRef<Record<string, boolean>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  // Refs para variables de control que no desencadenan renderizado por sí mismas
  const intentos = useRef<number>(Number(localStorage.getItem('visimap_intentos') || 0));
  const bloqueadoHasta = useRef<number>(Number(localStorage.getItem('visimap_bloqueado_hasta') || 0));
  const minutosBloqueo = useRef<number>(Number(localStorage.getItem('visimap_minutos_bloqueo') || 1));
  // Estado para saber cuántos segundos le queda de bloqueo (desencadena re-render para actualizar el temporizador)
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  // Cuenta atrás del bloqueo cada segundo en tiempo real
  React.useEffect(() => {
    const verificarTiempoRestante = () => {
      const ahora = Date.now();
      if (bloqueadoHasta.current > ahora) {
        // Diferencia y la convertimos a segundos (redondeando hacia arriba)
        setSegundosRestantes(Math.ceil((bloqueadoHasta.current - ahora) / 1000));
      } else {
        setSegundosRestantes(0);
      }
    };

    verificarTiempoRestante();
    const timerInterval = setInterval(verificarTiempoRestante, 1000);

    return () => clearInterval(timerInterval);
  }, []);

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
    errorStatus.current[name] = hasError;
  };

  // Envío del formulario con la seguridad de los bloqueos.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Si el usuario está bloqueado por tiempo, impedimos cualquier petición a la base de datos
    if (segundosRestantes > 0) {
      setSubmissionError(`Acceso temporalmente deshabilitado. Por favor, espera ${segundosRestantes} segundos.`);
      return;
    }

    if (Object.values(errorStatus.current).some(v => v)) {
      setSubmissionError('Por favor, corrige los errores en el formulario.');
      return;
    }

    try {
      // Intentamos iniciar sesión llamando al repositorio de autenticación
      await onLogin(email, password);

      // Si es correcto, reseteamos todo.
      localStorage.removeItem('visimap_intentos');
      localStorage.removeItem('visimap_bloqueado_hasta');
      localStorage.removeItem('visimap_minutos_bloqueo');
      intentos.current = 0;
      bloqueadoHasta.current = 0;
      minutosBloqueo.current = 1;
      setSegundosRestantes(0);

    } catch (err: any) {
      // ¡LOGIN INCORRECTO!
      const nuevosIntentos = intentos.current + 1;

      if (nuevosIntentos >= 5) {
        // Si falla 5 veces consecutivas, calculamos la penalización
        const minutosActuales = minutosBloqueo.current;
        const tiempoBloqueoMs = minutosActuales * 60 * 1000;
        const nuevaFechaBloqueo = Date.now() + tiempoBloqueoMs;

        // Bloqueamos el login guardando la fecha de desbloqueo en estado y localStorage
        bloqueadoHasta.current = nuevaFechaBloqueo;
        localStorage.setItem('visimap_bloqueado_hasta', String(nuevaFechaBloqueo));

        // Reseteamos los intentos para la siguiente ronda de pruebas tras desbloquearse
        intentos.current = 0;
        localStorage.setItem('visimap_intentos', '0');

        // Aumentamos los minutos progresivamente para el siguiente bloqueo (+1 minuto más)
        const siguienteMinuto = minutosActuales + 1;
        minutosBloqueo.current = siguienteMinuto;
        localStorage.setItem('visimap_minutos_bloqueo', String(siguienteMinuto));

        // Actualizamos segundosRestantes para reflejarlo en el botón inmediatamente
        setSegundosRestantes(Math.ceil(tiempoBloqueoMs / 1000));
        setSubmissionError(
          `Has alcanzado el límite de 5 intentos fallidos. Acceso bloqueado durante ${minutosActuales} minuto(s).`
        );
      } else {
        // Si aún le quedan intentos, simplemente actualizamos el contador
        intentos.current = nuevosIntentos;
        localStorage.setItem('visimap_intentos', String(nuevosIntentos));
        const intentosRestantes = 5 - nuevosIntentos;

        setSubmissionError(
          `Correo electrónico o contraseña incorrectos. Te quedan ${intentosRestantes} intentos.`
        );
      }
    }
  };

  return (
    <div className="login-bg">
      {/* Fondo fijo que cubre toda la pantalla, incluyendo la zona de barras de iOS */}
      <div className="login-bg-image" style={{ backgroundImage: `url('${fondoLoginImg}')` }} />
      <div className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border dark:border-slate-800">
        <div className="justify-center text-center mb-8 gap-4 items-center flex flex-col">
          {logoUrl && (
            <img
              src={theme === 'dark' ? (logoModoOscuroUrl || logoUrl) : logoUrl}
              alt="VisiMap Logo"
              className="size-32 object-contain transition-opacity duration-300"
              onError={(e: any) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = "size-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg";
                  fallback.innerText = "V";
                  parent.prepend(fallback);
                }
              }}
            />
          )}
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-white">Acceso Personal</h2>
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
            autoComplete="email"
            regex={/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/}
            error="Introduce un email válido (ej: usuario@empresa.com)"
            manejarCambio={manejarCambioEmail}
            manejarError={manejarError}
            disabled={segundosRestantes > 0}
          />

          <Input
            name="password"
            label="Contraseña"
            type="password"
            value={password}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error="La contraseña es obligatoria"
            manejarCambio={manejarCambioPassword}
            manejarError={manejarError}
            disabled={segundosRestantes > 0}
          />

          {submissionError && (
            <p className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 animate-in shake-in duration-300">
              {submissionError}
            </p>
          )}

          <button
            type="submit"
            disabled={segundosRestantes > 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/80 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {segundosRestantes > 0 ? `Bloqueado (Espera ${segundosRestantes}s)` : 'Iniciar Sesión'}
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
