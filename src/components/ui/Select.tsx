import { forwardRef } from "react";
import { SelectProps } from "@/interfaces/ui";



const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  value = "",
  variant = "primario",
  disabled,
  manejarCambio,
  name,
  ...props
}, ref) => {
  const colorClass = `input-border-${variant}`;

  return (
    <section className="flex flex-col gap-2 w-full" aria-labelledby={`${name}-label`}>
      {label && (
        <label id={`${name}-label`} htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        ref={ref}
        value={value}
        disabled={disabled}
        className={`input-style-comun select-responsive select-color-text ${disabled ? "input-disabled" : `${colorClass}`
          }`}
        {...props}
        onChange={manejarCambio}
      >
        <option value="" className="text-slate-400">
          Elige una opción...
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-slate-900 dark:bg-slate-900 dark:text-slate-200"
          >
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
});

Select.displayName = "Select";

export default Select;
