/**
 * Módulo de declaración de interfaces para las propiedades (Props)
 * de los componentes genéricos de Interfaz de Usuario (UI).
 * @module
 */

import React, { TextareaHTMLAttributes, SelectHTMLAttributes, InputHTMLAttributes } from "react";

// --- Componente Toast ---

/** Tipos de notificaciones disponibles (colores/iconos) */
export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

/** Props para el componente de notificaciones flotantes (Toast/Snackbar) */
export interface ToastProps {
  /** Indica si la notificación está visible */
  open: boolean;
  /** Texto del mensaje a mostrar */
  mensaje: string;
  /** Variante visual de la notificación */
  tipo?: ToastTipo;
  /** Tiempo en milisegundos antes de desaparecer automáticamente */
  duracion?: number;
  /** Callback ejecutado al cerrar la notificación */
  onClose: () => void;
}

// --- Componente Modal ---

/** Tamaños predefinidos para los modales */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Props base para el componente contenedor Modal genérico */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

// --- Componente TextArea ---

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  mensajeError?: string;
  variant?: "primario" | "info";
  manejarCambio: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

// --- Componente TablaGenérica ---

/** Definición de una columna en la tabla genérica de datos */
export interface ColumnDef<T> {
  /** Clave del objeto de datos que corresponde a esta columna */
  key: string;
  /** Texto a mostrar en la cabecera */
  header: string;
  /** Permite ordenar por esta columna (true/false) */
  sortable?: boolean;
  /** Función de renderizado personalizado de la celda */
  render?: (row: T) => React.ReactNode;
  /**
   * Función opcional para obtener el valor que se usará al ordenar la columna.
   */
  sortAccessor?: (row: T) => string | number | null | undefined;
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

/** Props principales del Data Table dinámico y paginado */
export interface TablaGenericaProps<T> {
  /** Array de datos a mostrar */
  data: T[];
  /** Configuración de las columnas */
  columns: ColumnDef<T>[];
  /** Función para obtener un ID único por fila */
  getRowId: (row: T) => string | number;
  columnFilters?: ColumnFilter<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onDeleteSelected?: (ids: (string | number)[]) => void;
  deleteSelectedLabel?: string;
  onActivateSelected?: (ids: (string | number)[]) => void;
  activateSelectedLabel?: string;
  getRowActiveState?: (row: T) => boolean;
  isRowSelectable?: (row: T) => boolean;
  pageSize?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

// --- Componente Select ---

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

// --- Componente Input ---

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "primario" | "info";
  regex?: RegExp;
  name?: string;
  manejarCambio?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarError?: (nombre: string, error: boolean) => void;
}

// --- Componente Checkbox ---

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mensajeError?: string;
}
