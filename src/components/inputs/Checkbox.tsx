import { type InputHTMLAttributes, forwardRef } from "react";
import "../../styles/Inputs.css";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mensajeError?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  name,
  disabled,
  manejarCambio,
  mensajeError,
  ...props
}, ref) => {
  return (
    <section className="checkbox-container flex flex-col gap-1">
      <div className="flex items-center gap-2 group cursor-pointer">
        <input
          type="checkbox"
          id={name}
          name={name}
          ref={ref}
          disabled={disabled}
          className={`checkbox-input checkbox-responsive ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          aria-disabled={disabled}
          aria-invalid={!!mensajeError}
          aria-describedby={mensajeError ? `${name}-error` : undefined}
          {...props}
          onChange={manejarCambio}
        />

        <label
          htmlFor={name}
          className={`text-sm font-medium text-slate-700 select-none cursor-pointer transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "group-hover:text-blue-600"
          }`}
        >
          {label}
        </label>
      </div>
      {mensajeError && (
        <span
          id={`${name}-error`}
          aria-live="polite"
          className="span-error text-red-500 text-xs italic ml-7"
        >
          {mensajeError}
        </span>
      )}
    </section>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
