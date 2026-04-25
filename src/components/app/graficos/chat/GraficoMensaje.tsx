import React, { useMemo } from 'react';
import {
  BarChart, Bar,
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { GraficoGenerado } from '@/interfaces/ChatIA';

// ──────────────────────────────────────────────────────────────────────────────
// Tooltip personalizado del tema
// ──────────────────────────────────────────────────────────────────────────────

const TooltipIA = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chat-grafico-tooltip">
      {label && <p className="chat-grafico-tooltip-label">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="chat-grafico-tooltip-row">
          <span className="chat-grafico-tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="chat-grafico-tooltip-value">{entry.value?.toLocaleString('es-ES')}</span>
        </div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Colores de fallback usando los del tema
// ──────────────────────────────────────────────────────────────────────────────

const COLORES_TEMA = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
];

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────

interface GraficoMensajeProps {
  grafico: GraficoGenerado;
}

export const GraficoMensaje: React.FC<GraficoMensajeProps> = ({ grafico }) => {
  const colores = useMemo(
    () => (grafico.colores?.length > 0 ? grafico.colores : COLORES_TEMA),
    [grafico.colores]
  );

  const renderGrafico = () => {
    switch (grafico.tipo) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={grafico.datos} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
              <XAxis dataKey={grafico.claveX} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} dx={-5} />
              <Tooltip content={<TooltipIA />} cursor={{ fill: 'var(--color-neutral-50)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {grafico.claves.map((clave, i) => (
                <Bar key={clave} dataKey={clave} fill={colores[i % colores.length]} radius={[4, 4, 0, 0]} barSize={28} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={grafico.datos} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                {grafico.claves.map((clave, i) => (
                  <linearGradient key={clave} id={`grad-${clave}-${grafico.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colores[i % colores.length]} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={colores[i % colores.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
              <XAxis dataKey={grafico.claveX} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} dx={-5} />
              <Tooltip content={<TooltipIA />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {grafico.claves.map((clave, i) => (
                <Area
                  key={clave}
                  type="monotone"
                  dataKey={clave}
                  stroke={colores[i % colores.length]}
                  strokeWidth={2}
                  fill={`url(#grad-${clave}-${grafico.id})`}
                  activeDot={{ r: 5 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafico.datos} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
              <XAxis dataKey={grafico.claveX} tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} dx={-5} />
              <Tooltip content={<TooltipIA />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {grafico.claves.map((clave, i) => (
                <Line
                  key={clave}
                  type="monotone"
                  dataKey={clave}
                  stroke={colores[i % colores.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={grafico.datos}
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="65%"
                paddingAngle={3}
                dataKey={grafico.claves[0] || 'value'}
                nameKey={grafico.claveX}
                stroke="none"
              >
                {grafico.datos.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={colores[i % colores.length]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipIA />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            Tipo de gráfico no soportado: {grafico.tipo}
          </div>
        );
    }
  };

  return (
    <div className="chat-grafico-wrapper">
      <div className="chat-grafico-header">
        <p className="chat-grafico-titulo">{grafico.titulo}</p>
        {grafico.subtitulo && (
          <p className="chat-grafico-subtitulo">{grafico.subtitulo}</p>
        )}
      </div>
      <div className="chat-grafico-body">{renderGrafico()}</div>
    </div>
  );
};
