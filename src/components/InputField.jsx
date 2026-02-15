import { cn } from '../utils/utils';

export function InputField({
  label,
  id,
  type = 'text',
  className,
  labelClassName,
  containerClassName,
  isTextArea = false,
  error,
  ...props
}) {
  const Comp = isTextArea ? 'textarea' : 'input';
  const labelBaseClasses = "block text-xs font-bold uppercase tracking-wider mb-1";
  const inputBaseClasses = "w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all";

  return (
    <div className={cn("flex flex-col", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(labelBaseClasses, "text-gray-500", labelClassName)}
        >
          {label}
        </label>
      )}

      <Comp
        id={id}
        type={type}
        className={cn(
          inputBaseClasses,
          "border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
          className
        )}
        {...props}
      />

      {error && (
        <span className="text-red-500 text-xs mt-1">{error}</span>
      )}
    </div>
  );
}