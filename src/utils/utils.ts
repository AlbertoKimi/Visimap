import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilidades de eventos

export function formatearFechaInput(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatearRangoFechas(inicio: string | Date | null, fin: string | Date | null): string {
  if (!inicio) return '';
  const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const strInicio = new Date(inicio).toLocaleString('es-ES', opciones);
  const strFin = fin ? new Date(fin).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
  return strFin ? `${strInicio} → ${strFin}` : strInicio;
}
