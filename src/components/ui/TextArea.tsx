import { useState, type ChangeEvent, type TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  mensajeError?: string;
  variant?: "primario" | "info";
  manejarCambio: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  mensajeError,
  name,
  disabled,
  variant = "primario",
  manejarCambio,
  manejarError,
  ...props
}, ref) => {
  const [errorLocal, setErrorLocal] = useState(false);
  const [touched, setTouched] = useState(false);

  let colorClass = `input-border-${variant}`;
  if (touched) {
    colorClass = errorLocal ? "input-error" : "input-valido";
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    const nombre = e.currentTarget.name;
    const isError = !!(props.required && e.currentTarget.value.trim() === "");
    setErrorLocal(isError);
    if (manejarError) manejarError(nombre, isError);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (touched) {
        const isError = !!(props.required && e.target.value.trim() === "");
        setErrorLocal(isError);
    }
    manejarCambio(e);
  };

  return (
    <section className="flex flex-col gap-1.5 w-full" aria-labelledby={`${name}-label`}>
      <header>
        <label id={`${name}-label`} htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
          {label}
        </label>
      </header>

      <textarea
        id={name}
        ref={ref}
        name={name}
        disabled={disabled}
        aria-invalid={!!errorLocal}
        aria-describedby={errorLocal ? `${name}-error` : undefined}
        className={`input-style-comun textarea-style ${
          disabled ? "input-disabled" : `${colorClass}`
        }`}
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {errorLocal && (
        <footer className="mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <span id={`${name}-error`} className="span-error text-red-500 text-xs italic" role="alert">
            {mensajeError}
          </span>
        </footer>
      )}
    </section>
  );
});

TextArea.displayName = "TextArea";

export default TextArea;
