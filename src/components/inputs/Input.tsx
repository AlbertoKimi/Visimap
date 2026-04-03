import { useState, type InputHTMLAttributes, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../../styles/Inputs.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "primario" | "info";
  regex?: RegExp;
  name: string;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  manejarCambio,
  manejarError,
  error,
  name,
  disabled,
  regex,
  label,
  variant = "primario",
  type,
  ...props
}, ref) => {
  const [smError, setsmError] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let colorClass = `input-border-${variant}`;

  if (touched) {
    if (smError) {
      colorClass = "input-error";
    } else {
      colorClass = "input-valido";
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const nombre = e.currentTarget.name;
    const valor = e.currentTarget.value;
    
    let hasError = false;
    if (regex && !regex.test(valor)) {
      hasError = true;
    } else if (props.required && valor.trim() === "") {
      hasError = true;
    }

    setsmError(hasError);
    if (manejarError) {
      manejarError(nombre, hasError);
    }
  };

  const handleChangeInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si ya ha sido tocado, validamos en tiempo real para quitar el error
    if (touched) {
        const valor = e.target.value;
        let hasError = false;
        if (regex && !regex.test(valor)) hasError = true;
        else if (props.required && valor.trim() === "") hasError = true;
        setsmError(hasError);
    }
    manejarCambio(e);
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <section className="flex flex-col gap-2 w-full" aria-labelledby={`${name}-label`}>
      {label && (
        <label id={`${name}-label`} htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={name}
          ref={ref}
          type={inputType}
          name={name}
          disabled={disabled}
          onChange={handleChangeInternal}
          onBlur={handleBlur}
          className={`input-style-comun input-responsive ${
            disabled ? "input-disabled" : `${colorClass}`
          } ${isPassword ? "pr-11" : ""}`}
          aria-invalid={smError}
          aria-describedby={smError ? `${name}-error` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
          </button>
        )}
      </div>
      {smError && error && (
        <footer className="mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <p id={`${name}-error`} aria-live="polite" className="span-error text-red-500 text-xs italic">
            {error}
          </p>
        </footer>
      )}
    </section>
  );
});

Input.displayName = "Input";

export default Input;
