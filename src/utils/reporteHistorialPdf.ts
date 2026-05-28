import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VisitaHistorial, DesgloseItem } from '@/interfaces/Historial';
import { getNombreMes } from '@/utils/utils';
import logoVisimap from '@/assets/Logo-1-opt.webp';

/**
 * Carga una imagen (incluido WebP) y la convierte a un data URL PNG mediante un
 * canvas. jsPDF no decodifica WebP de forma fiable, así que la normalizamos a
 * PNG para poder incrustarla con doc.addImage sin sorpresas. Devuelve también
 * la relación de aspecto para escalar manteniendo proporciones.
 */
const imagenAPngDataUrl = async (src: string): Promise<{ dataUrl: string; ratio: number }> => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas');
  ctx.drawImage(img, 0, 0);
  return { dataUrl: canvas.toDataURL('image/png'), ratio: img.naturalWidth / img.naturalHeight };
};

/** Datos necesarios para componer el reporte histórico en PDF. */
export interface DatosReporteHistorial {
  datosMensuales: VisitaHistorial[];
  datosProvincias: DesgloseItem[];
  datosPaises: DesgloseItem[];
  totalAnual: number;
}

/**
 * Genera y descarga el reporte histórico de visitantes en PDF con formato
 * corporativo: portada con logo, secciones con descripción, tablas de color
 * unificado y cabecera/pie en todas las páginas. Controla los saltos de página
 * para que ningún título de sección quede huérfano (sin su tabla).
 * @param datos Conjunto de datos ya agregados que se vuelcan en el informe.
 */
export const generarReporteHistorialPdf = async ({
  datosMensuales,
  datosProvincias,
  datosPaises,
  totalAnual,
}: DatosReporteHistorial): Promise<void> => {
  const doc = new jsPDF();
  const now = new Date();
  const fechaStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Paleta corporativa unificada (coherente con el azul de la app)
  const AZUL: [number, number, number] = [37, 99, 235];        // blue-600
  const AZUL_OSCURO: [number, number, number] = [30, 41, 59];  // slate-800
  const GRIS: [number, number, number] = [100, 116, 139];      // slate-500
  const GRIS_CLARO: [number, number, number] = [241, 245, 249];// slate-100
  const GRIS_LINEA: [number, number, number] = [226, 232, 240];// slate-200

  const MARGIN = 14;
  const HEADER_LIGHT_H = 22; // alto reservado para la cabecera de páginas 2+
  const FOOTER_H = 16;       // alto reservado para el pie en todas las páginas

  // Cargamos el logo; si fallara, el informe se genera igual sin él.
  let logo: { dataUrl: string; ratio: number } | null = null;
  try {
    logo = await imagenAPngDataUrl(logoVisimap);
  } catch (e) {
    console.error('No se pudo cargar el logo para el PDF:', e);
  }

  // --- Portada (página 1): logo centrado + título + metadatos ---
  let cursorY = 16;
  if (logo) {
    const logoW = 26;
    const logoH = logoW / logo.ratio;
    doc.addImage(logo.dataUrl, 'PNG', (pageWidth - logoW) / 2, cursorY, logoW, logoH);
    cursorY += logoH + 8;
  } else {
    cursorY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...AZUL_OSCURO);
  doc.text('Reporte Histórico de Visitantes', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GRIS);
  doc.text('Visimap Analytics · Museo MUVI', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;
  doc.text(`Generado el ${fechaStr}`, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 9;

  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, cursorY, pageWidth - MARGIN, cursorY);
  cursorY += 12;

  // Si la sección que viene no cabe en lo que queda de página, saltamos a una
  // nueva. 
  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageHeight - FOOTER_H) {
      doc.addPage();
      cursorY = HEADER_LIGHT_H + 10;
    }
  };

  // Pinta el título de una sección (con acento de color) y su descripción.
  const addSection = (titulo: string, descripcion: string) => {
    // Reservamos espacio para título + descripción + cabecera de tabla y un
    // par de filas, de modo que nunca se imprima un título huérfano.
    ensureSpace(46);
    doc.setFillColor(...AZUL);
    doc.rect(MARGIN, cursorY - 4, 3, 6, 'F'); // barrita de acento a la izquierda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...AZUL_OSCURO);
    doc.text(titulo, MARGIN + 6, cursorY);
    cursorY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    const lineas = doc.splitTextToSize(descripcion, pageWidth - MARGIN * 2);
    doc.text(lineas, MARGIN, cursorY);
    cursorY += lineas.length * 4 + 3;
  };

  // Opciones comunes a todas las tablas
  const baseTabla: any = {
    margin: { top: HEADER_LIGHT_H + 8, bottom: FOOTER_H, left: MARGIN, right: MARGIN },
    theme: 'striped',
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', halign: 'left' },
    alternateRowStyles: { fillColor: GRIS_CLARO },
    styles: { fontSize: 10, cellPadding: 3, textColor: AZUL_OSCURO },
  };

  const totalHistorico = datosMensuales.reduce((acc, curr) => acc + curr.total, 0);
  const mediaMensual = Math.round(totalHistorico / (datosMensuales.length || 1));

  // 1. Resumen General
  addSection(
    'Resumen General',
    'Indicadores clave del total de visitantes registrados y su promedio mensual.'
  );
  autoTable(doc, {
    ...baseTabla,
    startY: cursorY,
    head: [['Concepto', 'Cantidad']],
    body: [
      ['Total Histórico', totalHistorico.toLocaleString()],
      [`Total Año ${now.getFullYear()}`, totalAnual.toLocaleString()],
      ['Media Mensual', mediaMensual.toLocaleString()],
    ],
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // 2. Evolución Mensual
  addSection(
    'Evolución Mensual',
    'Distribución del número de visitantes a lo largo de los meses registrados.'
  );
  autoTable(doc, {
    ...baseTabla,
    startY: cursorY,
    head: [['Año', 'Mes', 'Total Visitantes']],
    body: datosMensuales.map(item => [
      item.anio,
      getNombreMes(item.mes).charAt(0).toUpperCase() + getNombreMes(item.mes).slice(1),
      item.total.toLocaleString(),
    ]),
    columnStyles: { 2: { halign: 'right' } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // 3. Top 10 Provincias
  addSection(
    'Top 10 Provincias',
    'Provincias de origen con mayor número de visitantes nacionales.'
  );
  autoTable(doc, {
    ...baseTabla,
    startY: cursorY,
    head: [['#', 'Provincia', 'Total Visitantes']],
    body: datosProvincias.length > 0
      ? datosProvincias.map((p, i) => [i + 1, p.nombre, p.total.toLocaleString()])
      : [['—', 'Sin datos', '0']],
    columnStyles: { 0: { halign: 'center', cellWidth: 14 }, 2: { halign: 'right' } },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // 4. Top 10 Países
  addSection(
    'Top 10 Países',
    'Países de origen con mayor número de visitantes internacionales.'
  );
  autoTable(doc, {
    ...baseTabla,
    startY: cursorY,
    head: [['#', 'País', 'Total Visitantes']],
    body: datosPaises.length > 0
      ? datosPaises.map((p, i) => [i + 1, p.nombre, p.total.toLocaleString()])
      : [['—', 'Sin datos', '0']],
    columnStyles: { 0: { halign: 'center', cellWidth: 14 }, 2: { halign: 'right' } },
  });

  // --- Cabecera ligera (páginas 2+) y pie de página (todas) ---
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);

    if (i > 1) {
      if (logo) {
        const h = 11;
        const w = h * logo.ratio;
        doc.addImage(logo.dataUrl, 'PNG', MARGIN, 7, w, h);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...AZUL_OSCURO);
        doc.text('Reporte Histórico de Visitantes', MARGIN + w + 4, 14);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...AZUL_OSCURO);
        doc.text('Reporte Histórico de Visitantes', MARGIN, 14);
      }
      doc.setDrawColor(...AZUL);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, HEADER_LIGHT_H - 2, pageWidth - MARGIN, HEADER_LIGHT_H - 2);
    }

    doc.setDrawColor(...GRIS_LINEA);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, pageHeight - 13, pageWidth - MARGIN, pageHeight - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text('Visimap Analytics · Museo MUVI', MARGIN, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - MARGIN, pageHeight - 8, { align: 'right' });
  }

  doc.save(`Visimap_Reporte_Historial_${now.getFullYear()}.pdf`);
};
