import React, { useEffect, useState } from 'react';
import { Globe, Map as MapIcon, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/database/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VisitaHistorial, DesgloseItem, RawProvResult, RawPaisResult } from '@/interfaces/Historial';
import { getNombreMes } from '@/utils/utils';

export const Historial: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [datosMensuales, setDatosMensuales] = useState<VisitaHistorial[]>([]);
  const [datosProvincias, setDatosProvincias] = useState<DesgloseItem[]>([]);
  const [datosPaises, setDatosPaises] = useState<DesgloseItem[]>([]);
  const [totalAnual, setTotalAnual] = useState(0);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      // 1. Obtener totales por mes/año desde la vista vista_visitantes_totales
      const { data: vistaData, error: vistaError } = await supabase
        .from('vista_visitantes_totales')
        .select('total_personas, fecha');

      if (vistaError) throw vistaError;

      const resumenMensual: Record<string, number> = {};
      let totalA = 0;
      const currentYear = new Date().getFullYear();

      vistaData?.forEach(item => {
        const fecha = new Date(item.fecha);
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth();
        const key = `${anio}-${mes}`;

        resumenMensual[key] = (resumenMensual[key] || 0) + (item.total_personas || 0);

        if (anio === currentYear) {
          totalA += (item.total_personas || 0);
        }
      });

      const mensualArray: VisitaHistorial[] = Object.entries(resumenMensual)
        .map(([key, total]) => {
          const [anio, mes] = key.split('-').map(Number);
          return { anio, mes, total };
        })
        .sort((a, b) => b.anio !== a.anio ? b.anio - a.anio : b.mes - a.mes);

      setDatosMensuales(mensualArray);
      setTotalAnual(totalA);

      // 2. Por Provincias
      const { data: provData } = await supabase
        .from('registro_visitante')
        .select('cantidad, provincia:id_provincia(nombre_provincia)');

      const provMap: Record<string, number> = {};
      (provData as unknown as RawProvResult[] | null)?.forEach(r => {
        const nombre = r.provincia?.nombre_provincia || 'Otras';
        provMap[nombre] = (provMap[nombre] || 0) + (r.cantidad || 0);
      });

      setDatosProvincias(Object.entries(provMap)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10));

      // 3. Por Países
      const { data: paisData } = await supabase
        .from('registro_visitante')
        .select('cantidad, pais:id_pais(nombre_pais)');

      const paisMap: Record<string, number> = {};
      (paisData as unknown as RawPaisResult[] | null)?.forEach(r => {
        const nombre = r.pais?.nombre_pais || 'Otros';
        paisMap[nombre] = (paisMap[nombre] || 0) + (r.cantidad || 0);
      });

      setDatosPaises(Object.entries(paisMap)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10));

    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Título y Cabecera
    doc.setFontSize(20);
    doc.setTextColor(40, 44, 52);
    doc.text('Reporte Histórico de Visitantes', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${fechaStr}`, 14, 30);
    doc.text(`Visimap Analytics - Panel Administrativo`, 14, 35);

    // Resumen de Totales
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumen General:', 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [['Concepto', 'Cantidad']],
      body: [
        ['Total Histórico', datosMensuales.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()],
        [`Total Año ${now.getFullYear()}`, totalAnual.toLocaleString()],
        ['Media Mensual', Math.round(datosMensuales.reduce((acc, curr) => acc + curr.total, 0) / (datosMensuales.length || 1)).toLocaleString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Tabla Mensual
    doc.text('Evolución Mensual:', 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Año', 'Mes', 'Total Visitantes']],
      body: datosMensuales.map(item => [
        item.anio,
        getNombreMes(item.mes).charAt(0).toUpperCase() + getNombreMes(item.mes).slice(1),
        item.total.toLocaleString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    doc.save(`Visimap_Reporte_Historial_${now.getFullYear()}.pdf`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-7xl flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-slate-100 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Historial de Datos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold opacity-70">
            Registro histórico completo de visitantes y desgloses geográficos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportarPDF}
            disabled={loading || datosMensuales.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm font-medium disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span className="text-sm">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Año {new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? <Skeleton className="h-9 w-24 bg-white/20" /> : totalAnual.toLocaleString()}</div>
            <p className="text-xs text-blue-200 mt-1">Visitantes registrados hasta hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {loading ? <Skeleton className="h-9 w-24" /> : datosMensuales.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Desde el inicio de los registros</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Media Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {loading ? <Skeleton className="h-9 w-24" /> : Math.round(datosMensuales.reduce((acc, curr) => acc + curr.total, 0) / (datosMensuales.length || 1)).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Visitantes por mes promedio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla de Historial Mensual */}
        <Card className="xl:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Evolución Mensual Detallada
                </CardTitle>
                <CardDescription>Resumen de visitantes por mes y año</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Año</th>
                    <th className="px-6 py-4 font-semibold">Mes</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Visitantes</th>
                    <th className="px-6 py-4 font-semibold text-center">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      </tr>
                    ))
                  ) : datosMensuales.length > 0 ? (
                    datosMensuales.map((item, i) => {
                      const trend = i < datosMensuales.length - 1 ? item.total - datosMensuales[i + 1].total : 0;
                      return (
                        <tr key={`${item.anio}-${item.mes}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.anio}</td>
                          <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-300">{getNombreMes(item.mes)}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{item.total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            {trend > 0 ? (
                              <span className="text-emerald-500 text-xs font-bold">↑</span>
                            ) : trend < 0 ? (
                              <span className="text-red-500 text-xs font-bold">↓</span>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No hay datos históricos disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Desgloses Laterales */}
        <div className="space-y-6">
          {/* Top Provincias */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-purple-500" />
                Top 10 Provincias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                ) : datosProvincias.map((p, i) => (
                  <div key={p.nombre} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">{i + 1}.</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{p.nombre}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{p.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Países */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Top 10 Países
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                ) : datosPaises.map((p, i) => (
                  <div key={p.nombre} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">{i + 1}.</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{p.nombre}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{p.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Historial;
