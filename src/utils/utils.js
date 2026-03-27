import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Utilidades de eventos ───────────────────────────────────────────────────

export function formatearFechaInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatearRangoFechas(inicio, fin) {
  if (!inicio) return '';
  const opciones = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const strInicio = new Date(inicio).toLocaleString('es-ES', opciones);
  const strFin = fin ? new Date(fin).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
  return strFin ? `${strInicio} → ${strFin}` : strInicio;
}