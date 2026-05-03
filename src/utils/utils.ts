import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilidades de eventos

export function formatearFechaInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatearRangoFechas(inicio: string | Date | null | undefined, fin: string | Date | null | undefined): string {
  if (!inicio) return '';
  const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const strInicio = new Date(inicio).toLocaleString('es-ES', opciones);
  const strFin = fin ? new Date(fin).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
  return strFin ? `${strInicio} → ${strFin}` : strInicio;
}

export function formatearFecha(date: string | Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const mesActualRango = () => {
  const now = new Date();
  return getRangoPeriodo(now.getMonth(), now.getFullYear());
};

export const getRangoPeriodo = (mes: number, anio: number) => {
  const inicio = new Date(anio, mes, 1).toISOString();
  const fin = new Date(anio, mes + 1, 0, 23, 59, 59).toISOString();
  return { inicio, fin };
};

export const getNombreMesActual = () => {
  return getNombreMes(new Date().getMonth());
};

export const getNombreMes = (mes: number) => {
  const nombre = new Date(2024, mes, 1).toLocaleDateString('es-ES', { month: 'long' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

// Utilidades de tabla
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
}

export function toStr(val: any): string {
  if (val == null) return '';
  return String(val).toLowerCase();
}

export function calcularPaginas(totalPages: number, currentPage: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }
  return pages;
}
