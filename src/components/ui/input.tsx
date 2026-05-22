import { useState, useEffect, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputProps } from "@/interfaces/ui";

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
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (touched && props.value !== undefined) {
      const valor = String(props.value);
      let hasError = false;
      let errMsg: string | null = null;
      if (props.required && valor.trim() === "") {
        hasError = true;
        errMsg = "Este campo es obligatorio.";
      } else if (regex && !regex.test(valor)) {
        hasError = true;
        errMsg = error || "Formato no válido.";
      }
      setsmError(hasError);
      setLocalErrorMessage(errMsg);
    }
  }, [props.value, touched, regex, props.required, error]);

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
    let errMsg: string | null = null;
    if (props.required && valor.trim() === "") {
      hasError = true;
      errMsg = "Este campo es obligatorio.";
    } else if (regex && !regex.test(valor)) {
      hasError = true;
      errMsg = error || "Formato no válido.";
    }

    setsmError(hasError);
    setLocalErrorMessage(errMsg);
    if (manejarError) {
      manejarError(nombre, hasError);
    }
  };

  const handleChangeInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (touched) {
      let hasError = false;
      let errMsg: string | null = null;
      if (props.required && valor.trim() === "") {
        hasError = true;
        errMsg = "Este campo es obligatorio.";
      } else if (regex && !regex.test(valor)) {
        hasError = true;
        errMsg = error || "Formato no válido.";
      }
      setsmError(hasError);
      setLocalErrorMessage(errMsg);
    }
    if (manejarCambio) {
      manejarCambio(e);
    } else if (props.onChange) {
      props.onChange(e);
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <section className="flex flex-col gap-1.5 w-full min-w-0" aria-labelledby={`${name}-label`}>
      {label && (
        <label id={`${name}-label`} htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative w-full min-w-0">
        <input
          id={name}
          ref={ref}
          type={inputType}
          name={name}
          disabled={disabled}
          onChange={handleChangeInternal}
          onBlur={handleBlur}
          autoCapitalize={isPassword || type === "email" ? "none" : (props.autoCapitalize as any)}
          autoCorrect={isPassword || type === "email" ? "off" : (props.autoCorrect as any)}
          spellCheck={isPassword || type === "email" ? false : props.spellCheck}
          className={`input-style-comun input-responsive ${disabled ? "input-disabled" : `${colorClass}`
            } ${isPassword ? "pr-11" : ""} ${props.className || ""}`}
          aria-invalid={smError}
          aria-describedby={smError ? `${name}-error` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
          </button>
        )}
      </div>
      {smError && (localErrorMessage || error) && (
        <footer className="mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <p id={`${name}-error`} aria-live="polite" className="span-error text-red-500 text-xs italic">
            {localErrorMessage || error}
          </p>
        </footer>
      )}
    </section>
  );
});

Input.displayName = "Input";

export { Input };
export default Input;
