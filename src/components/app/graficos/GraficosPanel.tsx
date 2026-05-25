import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { TarjetaGrafico } from './TarjetaGrafico';
import { RepositoryFactory } from '@/database/RepositoryFactory';

const statsRepo = RepositoryFactory.getStatsRepository();

import {
  ActividadTrabajador,
  EvolucionDiaria,
  VisitaProvincia,
  PerfilRaw,
  CustomBarLabelProps
} from '@/interfaces/Graficos';
import Select from '@/components/ui/Select';
import { COLORES_PIE } from '@/constantes/appConstants';
import { getRangoPeriodo, getNombreMes } from '@/utils/utils';

const TooltipPersonalizado = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 text-sm z-50">
      {label && <p className="font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry: { name: string; value: number; color: string }) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 font-semibold">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
            </div>
            <span className="text-slate-900 dark:text-white">{entry.value?.toLocaleString('es-ES')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeyendaConTotal = ({ payload, total }: { payload?: { value: string | number; color?: string }[]; total: number | string }) => (
  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium mt-4">
    {payload?.map((entry, index) => (
      <div key={`legend-${entry.value || index}`} className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-default">
        <span className="size-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
        <span className="text-slate-600 dark:text-slate-400">{entry.value}</span>
      </div>
    ))}
    <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6 ml-2">
      <span className="size-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
      <span className="text-slate-900 dark:text-slate-200 font-bold">Total: {typeof total === 'number' ? total.toLocaleString('es-ES') : total}</span>
    </div>
  </div>
);

const CustomBarLabel: React.FC<CustomBarLabelProps> = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value = 0,
  payload,
  index,
  data,
  isDark = false,
  fontSize = 9,
  showZeroIfTotalZero = false,
  targetKey
}) => {
  const numX = typeof x === 'string' ? parseFloat(x) : Number(x || 0);
  const numY = typeof y === 'string' ? parseFloat(y) : Number(y || 0);
  const numWidth = typeof width === 'string' ? parseFloat(width) : Number(width || 0);
  const numHeight = typeof height === 'string' ? parseFloat(height) : Number(height || 0);

  let displayValue = 0;
  if (targetKey && payload) {
    const rawVal = payload[targetKey] !== undefined
      ? payload[targetKey]
      : (payload.payload?.[targetKey] !== undefined
        ? payload.payload[targetKey]
        : undefined);

    if (rawVal !== undefined) {
      displayValue = Number(rawVal);
    } else {
      displayValue = Number(value);
    }
  } else if (targetKey && data && typeof index === 'number' && data[index]) {
    const row = data[index];
    const rawVal = row[targetKey];
    if (rawVal !== undefined) {
      displayValue = Number(rawVal);
    } else {
      displayValue = Number(value);
    }
  } else {
    displayValue = Number(value);
  }

  if (displayValue === 0) {
    if (showZeroIfTotalZero && payload && payload.total === 0) {
      return (
        <text
          x={numX + 5}
          y={numY + numHeight / 2}
          textAnchor="start"
          dominantBaseline="central"
          style={{
            fill: isDark ? '#cbd5e1' : '#334155',
            fontSize,
            fontWeight: 'bold',
            pointerEvents: 'none'
          }}
        >
          0
        </text>
      );
    }
    return null;
  }

  // Estimar el ancho del texto en píxeles
  const textStr = String(displayValue);
  const baseFontSize = Number(fontSize);
  const estimateTextWidth = (size: number) => textStr.length * size * 0.62;
  const padding = 1;

  // Buscamos el tamaño de fuente que quepa dentro (entre 6px y baseFontSize) para mantener
  // las etiquetas SIEMPRE dentro de su barra y evitar superposiciones
  let usableFontSize = baseFontSize;
  while (estimateTextWidth(usableFontSize) + padding * 2 > numWidth && usableFontSize > 6) {
    usableFontSize -= 1;
  }
  const fitsInside = estimateTextWidth(usableFontSize) + padding * 2 <= numWidth;

  if (fitsInside) {
    // Etiqueta DENTRO de la barra
    return (
      <text
        x={numX + numWidth / 2}
        y={numY + numHeight / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fill: '#ffffff',
          fontSize: usableFontSize,
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        {displayValue}
      </text>
    );
  }

  // Solo si la barra es realmente diminuta (<6px aprox).
  return (
    <text
      x={numX + numWidth + 5}
      y={numY + numHeight / 2}
      textAnchor="start"
      dominantBaseline="central"
      style={{
        fill: isDark ? '#cbd5e1' : '#334155',
        fontSize: Math.max(8, baseFontSize - 1),
        fontWeight: 'bold',
        pointerEvents: 'none'
      }}
    >
      {displayValue}
    </text>
  );
};

/**
 * Panel de gráficos estadísticos del Dashboard.
 * Este componente orquesta múltiples gráficos (`TarjetaGrafico`) y realiza las
 * peticiones a la base de datos (Supabase) para agrupar y contar registros de visitantes,
 * grupos y eventos, transformando la información en un formato apto para Recharts.
 * @returns Componente de panel con los indicadores analíticos clave
 */
export const GraficosPanel: React.FC = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));


  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Calculamos estos valores directamente en cada renderizado
  const nombreMes = getNombreMes(selectedMonth);
  const rango = getRangoPeriodo(selectedMonth, selectedYear);

  const [loadingEspania, setLoadingEspania] = useState(true);
  const [datosEspania, setDatosEspania] = useState<{ name: string; España: number; 'Resto del Mundo': number }[]>([]);

  const [loadingProvincias, setLoadingProvincias] = useState(true);
  const [datosProvincias, setDatosProvincias] = useState<VisitaProvincia[]>([]);

  const [loadingEvolucion, setLoadingEvolucion] = useState(true);
  const [datosEvolucion, setDatosEvolucion] = useState<EvolucionDiaria[]>([]);

  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
  const [datosTrabajadores, setDatosTrabajadores] = useState<ActividadTrabajador[]>([]);

  const [loadingEventosMes, setLoadingEventosMes] = useState(true);
  const [datosEventosMes, setDatosEventosMes] = useState<{ name: string; value: number }[]>([]);

  const fetchEspania = async () => {
    setLoadingEspania(true);
    try {
      const { inicio, fin } = rango;

      // Consultamos en paralelo las dos fuentes de visitantes:
      //  - registro_visitante (ventanilla individual)
      //  - grupo_visitante (subgrupos asociados a eventos), filtrando por fecha_inicio del evento
      const [ventanilla, grupos] = await Promise.all([
        statsRepo.getRegistrosVisitante({
          inicio,
          fin,
          seleccion: 'cantidadProvinciaPais',
        }),
        statsRepo.getGruposEnRango({ inicio, fin }),
      ]);

      let españa = 0;
      let mundo = 0;

      // 1. Ventanilla: sumamos según el país asignado al registro
      for (const r of ventanilla) {
        if (r.pais?.nombre_pais === 'España') españa += (r.cantidad || 0);
        else mundo += (r.cantidad || 0);
      }

      // 2. Eventos: si tiene id_provincia → España. Si solo tiene id_pais → según el país.
      for (const g of grupos) {
        const personas = g.num_visitantes || 0;
        if (g.id_provincia != null) {
          españa += personas;
        } else if (g.pais?.nombre_pais?.toLowerCase() === 'españa') {
          españa += personas;
        } else {
          mundo += personas;
        }
      }

      setDatosEspania([{ name: nombreMes, España: españa, 'Resto del Mundo': mundo }]);
    } catch (err) {
      console.error('Error fetchEspania:', err);
    } finally {
      setLoadingEspania(false);
    }
  };

  const fetchEvolucion = async () => {
    setLoadingEvolucion(true);
    try {
      const { inicio, fin } = rango;
      const now = new Date(selectedYear, selectedMonth + 1, 0);
      const diasDelMes = now.getDate();

      const [registrosNormales, gruposEventos] = await Promise.all([
        statsRepo.getRegistrosVisitante({
          inicio,
          fin,
          seleccion: 'cantidadFechaTipo',
        }),
        statsRepo.getGruposEnRango({ inicio, fin }),
      ]);

      const mapaDias: Record<string, { individuales: number; grupos: number }> = {};
      for (let i = 1; i <= diasDelMes; i++) {
        mapaDias[i.toString()] = { individuales: 0, grupos: 0 };
      }

      for (const r of registrosNormales) {
        if (!r.creado_en) continue;
        const dia = new Date(r.creado_en).getDate().toString();
        if (!mapaDias[dia]) continue;
        if (r.tipo_visita === 'individual') {
          mapaDias[dia].individuales += (r.cantidad || 0);
        } else {
          mapaDias[dia].grupos += (r.cantidad || 0);
        }
      }

      for (const g of gruposEventos) {
        const fechaInicio = g.evento?.fecha_inicio;
        if (!fechaInicio) continue;
        const dia = new Date(fechaInicio).getDate().toString();
        if (mapaDias[dia]) {
          mapaDias[dia].grupos += (g.num_visitantes || 0);
        }
      }

      const arr = Object.entries(mapaDias).map(([dia, vals]) => ({
        dia: `Día ${dia}`,
        visitantesIndividuales: vals.individuales,
        visitantesGrupo: vals.grupos,
        total: vals.individuales + vals.grupos
      }));

      setDatosEvolucion(arr);
    } catch (err) {
      console.error('Error fetchEvolucion:', err);
    } finally {
      setLoadingEvolucion(false);
    }
  };

  const fetchProvincias = async () => {
    setLoadingProvincias(true);
    try {
      const { inicio, fin } = rango;

      const [registros, grupos] = await Promise.all([
        statsRepo.getRegistrosVisitante({
          inicio,
          fin,
          seleccion: 'cantidadProvinciaPais',
        }),
        statsRepo.getGruposEnRango({ inicio, fin }),
      ]);

      const mapa: Record<string, { normales: number; eventos: number }> = {};

      for (const r of registros) {
        if (r.pais?.nombre_pais !== 'España') continue;
        const prov = r.provincia?.nombre_provincia ?? 'Desconocida';
        if (!mapa[prov]) mapa[prov] = { normales: 0, eventos: 0 };
        mapa[prov].normales += (r.cantidad || 0);
      }

      for (const g of grupos) {
        if (g.id_provincia != null) {
          const prov = g.provincia?.nombre_provincia ?? 'Desconocida';
          if (!mapa[prov]) mapa[prov] = { normales: 0, eventos: 0 };
          mapa[prov].eventos += (g.num_visitantes || 0);
        }
      }

      const resultado: VisitaProvincia[] = Object.entries(mapa)
        .map(([provincia, vals]) => ({
          provincia,
          visitantesNormales: vals.normales || 0,
          visitantesEventos: vals.eventos || 0,
          total: (vals.normales || 0) + (vals.eventos || 0)
        }))
        .filter(p => p.total > 0)
        .sort((a, b) => b.total - a.total);

      setDatosProvincias(resultado);
    } catch (err) {
      console.error('Error fetchProvincias:', err);
    } finally {
      setLoadingProvincias(false);
    }
  };

  const fetchTrabajadores = async () => {
    setLoadingTrabajadores(true);
    try {
      const { inicio, fin } = rango;

      const [perfiles, registros, eventosUsuarios, notas] = await Promise.all([
        statsRepo.getPerfilesActivos(),
        statsRepo.getRegistrosVisitante({ inicio, fin, seleccion: 'idUsuario' }),
        statsRepo.getEventosUsuariosPorPeriodo(inicio, fin),
        statsRepo.getNotasUsuariosPorPeriodo(inicio, fin),
      ]);

      const mapa: Record<string, ActividadTrabajador> = {};
      for (const p of perfiles as PerfilRaw[]) {
        mapa[p.id] = {
          id: p.id,
          nombre: p.nombre || p.nombre_usuario || 'Desconocido',
          registros: 0,
          eventos: 0,
          notas: 0,
          total: 0
        };
      }

      registros.forEach(r => {
        if (r.id_usuario && mapa[r.id_usuario]) mapa[r.id_usuario].registros += 1;
      });
      eventosUsuarios.forEach(e => {
        if (mapa[e.id_usuario]) mapa[e.id_usuario].eventos += 1;
      });
      notas.forEach(n => {
        if (mapa[n.creado_por]) mapa[n.creado_por].notas += 1;
      });

      const resultado = Object.values(mapa)
        .map(w => ({
          ...w,
          total: (w.registros || 0) + (w.eventos || 0) + (w.notas || 0)
        }))
        .sort((a, b) => b.total - a.total);

      setDatosTrabajadores(resultado);
    } catch (err) {
      console.error('Error fetchTrabajadores:', err);
    } finally {
      setLoadingTrabajadores(false);
    }
  };

  const fetchEventosMes = async () => {
    setLoadingEventosMes(true);
    try {
      const { inicio, fin } = rango;

      const grupos = await statsRepo.getGruposEnRango({
        inicio,
        fin,
        incluirCategoria: true,
      });

      const mapa: Record<string, number> = {};

      for (const g of grupos) {
        const nombreCategoria = g.evento?.tipo_evento?.nombre || 'Categoría Desconocida';
        mapa[nombreCategoria] = (mapa[nombreCategoria] || 0) + (g.num_visitantes || 0);
      }

      const resultado = Object.entries(mapa)
        .map(([name, value]) => ({ name, value }))
        .filter(e => e.value > 0)
        .sort((a, b) => b.value - a.value);

      setDatosEventosMes(resultado);
    } catch (err) {
      console.error('Error fetchEventosMes:', err);
    } finally {
      setLoadingEventosMes(false);
    }
  };

  const fetchTodo = () => {
    fetchEspania();
    fetchEvolucion();
    fetchProvincias();
    fetchTrabajadores();
    fetchEventosMes();
  };

  useEffect(() => {
    fetchTodo();
    const intervalo = setInterval(fetchTodo, 1_800_000); // 30 minutos
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">

      {/* Selector de Periodo */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-end gap-4">
        <div className="w-full sm:w-48">
          <Select
            label="Mes"
            name="month"
            value={selectedMonth.toString()}
            manejarCambio={(e) => setSelectedMonth(parseInt(e.target.value))}
            options={[
              { label: 'Enero', value: '0' },
              { label: 'Febrero', value: '1' },
              { label: 'Marzo', value: '2' },
              { label: 'Abril', value: '3' },
              { label: 'Mayo', value: '4' },
              { label: 'Junio', value: '5' },
              { label: 'Julio', value: '6' },
              { label: 'Agosto', value: '7' },
              { label: 'Septiembre', value: '8' },
              { label: 'Octubre', value: '9' },
              { label: 'Noviembre', value: '10' },
              { label: 'Diciembre', value: '11' },
            ]}
          />
        </div>
        <div className="w-full sm:w-32">
          <Select
            label="Año"
            name="year"
            value={selectedYear.toString()}
            manejarCambio={(e) => setSelectedYear(parseInt(e.target.value))}
            options={[
              { label: '2024', value: '2024' },
              { label: '2025', value: '2025' },
              { label: '2026', value: '2026' },
            ]}
          />
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={fetchTodo}
          className="btn-secondary h-11 px-4 mb-0.5 flex items-center gap-2"
          title="Refrescar datos manualmente"
        >
          <RefreshCw className={`size-4 ${loadingEvolucion ? 'animate-spin' : ''}`} />
          <span>Actualizar datos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full pb-10">

        <svg style={{ height: 0, width: 0, position: 'absolute' }}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-secondary-500)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-secondary-500)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </svg>

        {/* 1. Evolución diaria */}
        <div className="xl:col-span-2">
          {(() => {
            const total = datosEvolucion.reduce((acc, curr) => acc + (curr.total || 0), 0);
            return (
              <TarjetaGrafico
                titulo={`Tráfico y Visitantes en ${nombreMes}`}
                subtitulo={`Evolución desglosada por días durante el mes de ${nombreMes}`}
                isLoading={loadingEvolucion}
                onRefresh={fetchEvolucion}
                altura="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosEvolucion} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Legend content={<LeyendaConTotal total={total} />} />
                    <Area
                      type="monotone"
                      dataKey="visitantesIndividuales"
                      name="Individuales"
                      stroke="var(--color-primary-500)"
                      strokeWidth={3}
                      fill="url(#colorPrimary)"
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitantesGrupo"
                      name="Grupos (Eventos)"
                      stroke="var(--color-secondary-500)"
                      strokeWidth={3}
                      fill="url(#colorSecondary)"
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TarjetaGrafico>
            );
          })()}
        </div>

        {/* 2. Provincias */}
        {(() => {
          const total = datosProvincias.reduce((acc, curr) => acc + (curr.total || 0), 0);
          return (
            <TarjetaGrafico
              titulo={`Procedencia Nacional en ${nombreMes}`}
              subtitulo={`Todas las provincias en ${nombreMes} (Ventanilla + Eventos Grupales)`}
              isLoading={loadingProvincias}
              onRefresh={fetchProvincias}
              altura="h-96"
            >
              {datosProvincias.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">Sin datos de provincias registrados este mes</div>
              ) : (
                <div className="size-full overflow-y-auto pr-2 custom-scrollbar">
                  <ResponsiveContainer width="100%" height={Math.max(300, datosProvincias.length * 40)}>
                    <BarChart
                      data={datosProvincias}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="provincia"
                        tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)' }} />
                      <Legend content={<LeyendaConTotal total={total} />} />
                      <Bar dataKey="visitantesNormales" name="Individuales" stackId="a" fill="var(--color-primary-400)" radius={[0, 0, 0, 0]} barSize={18} isAnimationActive={false}>
                        <LabelList dataKey="visitantesNormales" content={<CustomBarLabel isDark={isDark} fontSize={9} targetKey="visitantesNormales" />} />
                      </Bar>
                      <Bar dataKey="visitantesEventos" name="Grupos/Eventos" stackId="a" fill="var(--color-secondary-400)" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false}>
                        <LabelList dataKey="visitantesEventos" content={<CustomBarLabel isDark={isDark} fontSize={9} targetKey="visitantesEventos" />} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TarjetaGrafico>
          );
        })()}

        {/* 3. Actividad Trabajadores (Stacked Bar) */}
        <TarjetaGrafico
          titulo={`Rendimiento del Personal en ${nombreMes}`}
          subtitulo="Número de registros, eventos y notas originadas"
          isLoading={loadingTrabajadores}
          onRefresh={fetchTrabajadores}
          altura="h-96"
        >
          {datosTrabajadores.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">Sin actividad registrada este mes</div>
          ) : (
            <div className="size-full overflow-y-auto pr-2 overflow-x-hidden custom-scrollbar">
              <ResponsiveContainer width="100%" height={Math.max(200, datosTrabajadores.length * 60 + 60)}>
                <BarChart
                  data={datosTrabajadores}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />

                  <Bar dataKey="registros" name="Registros" stackId="a" fill="var(--color-info)" barSize={28} radius={[0, 0, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="registros" content={<CustomBarLabel isDark={isDark} fontSize={10} showZeroIfTotalZero={true} targetKey="registros" />} />
                  </Bar>
                  <Bar dataKey="eventos" name="Eventos Org." stackId="a" fill="var(--color-warning)" barSize={28} radius={[0, 0, 0, 0]} isAnimationActive={false}>
                    <LabelList dataKey="eventos" content={<CustomBarLabel isDark={isDark} fontSize={10} targetKey="eventos" />} />
                  </Bar>
                  <Bar dataKey="notas" name="Notas Creadas" stackId="a" fill="var(--color-success)" barSize={28} radius={[0, 6, 6, 0]} isAnimationActive={false}>
                    <LabelList dataKey="notas" content={<CustomBarLabel isDark={isDark} fontSize={10} targetKey="notas" />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </TarjetaGrafico>

        {/* 4. España vs Mundo */}
        {(() => {
          const total = datosEspania.reduce((acc, curr) => acc + (curr.España || 0) + (curr['Resto del Mundo'] || 0), 0);
          return (
            <TarjetaGrafico
              titulo={`Procedencia Internacional en ${nombreMes}`}
              subtitulo={`Ventanilla + Eventos (${nombreMes})`}
              isLoading={loadingEspania}
              onRefresh={fetchEspania}
              altura="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosEspania} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" hide />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)' }} />
                  <Legend content={<LeyendaConTotal total={total} />} />
                  <Bar dataKey="España" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} barSize={40}>
                    <LabelList dataKey="España" position="top" style={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: 'bold' }} />
                  </Bar>
                  <Bar dataKey="Resto del Mundo" fill="var(--color-secondary-500)" radius={[6, 6, 0, 0]} barSize={40}>
                    <LabelList dataKey="Resto del Mundo" position="top" style={{ fill: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TarjetaGrafico>
          );
        })()}

        {/* 5. Círculo de Categorías de Eventos */}
        {(() => {
          const total = datosEventosMes.reduce((acc, curr) => acc + (curr.value || 0), 0);
          return (
            <TarjetaGrafico
              titulo={`Categorías de Eventos en ${nombreMes}`}
              subtitulo={`Porcentaje de visitantes según tipo de evento (${nombreMes})`}
              isLoading={loadingEventosMes}
              onRefresh={fetchEventosMes}
              altura="h-64"
            >
              {datosEventosMes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">Sin eventos en {nombreMes}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosEventosMes}
                      cx="50%"
                      cy="46%"
                      innerRadius="35%"
                      outerRadius="58%"
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {datosEventosMes.map((entry, i) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Legend content={<LeyendaConTotal total={total} />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </TarjetaGrafico>
          );
        })()}

      </div>
    </div>
  );
};
