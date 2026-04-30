import { TextareaHTMLAttributes, SelectHTMLAttributes, InputHTMLAttributes } from "react";

// Toast.tsx
export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  open: boolean;
  mensaje: string;
  tipo?: ToastTipo;
  duracion?: number;
  onClose: () => void;
}

// TextArea.tsx
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  mensajeError?: string;
  variant?: "primario" | "info";
  manejarCambio: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

// TablaGenerica.tsx
export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnFilter<T = any> {
  key: string;
  label: string;
  options: FilterOption[];
  filterFn?: (row: T, value: string) => boolean;
}

export interface TablaGenericaProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string | number;
  columnFilters?: ColumnFilter<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onDeleteSelected?: (ids: (string | number)[]) => void;
  deleteSelectedLabel?: string;
  pageSize?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

// Select.tsx
export interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  variant?: "primario" | "info";
  manejarCambio: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// input.tsx
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "primario" | "info";
  regex?: RegExp;
  name?: string;
  manejarCambio?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

// Checkbox.tsx
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mensajeError?: string;
}
