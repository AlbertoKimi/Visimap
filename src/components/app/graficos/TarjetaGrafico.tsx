import React, { useRef } from 'react';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { TarjetaGraficoProps } from "@/interfaces/components";
import html2canvas from 'html2canvas';

/**
 * Componente contenedor de las gráficas (`Card`).
 * Proporciona un marco visual consistente con cabecera, controles de recarga manual,
 * y funcionalidad de exportación a PNG. Renderiza el gráfico o un estado de carga.
 * @param props.titulo - Título principal de la tarjeta
 * @param props.subtitulo - Contexto adicional sobre los datos mostrados
 * @param props.icono - Icono decorativo de Lucide React
 * @param props.colorIcono - Clases de Tailwind para el gradiente del icono
 * @param props.isLoading - Estado de carga activa de los datos del gráfico
 * @param props.onRefresh - Callback para actualizar manualmente los datos del gráfico
 * @param props.altura - Clase CSS para definir la altura de la tarjeta
 * @param props.children - Componente del gráfico interno (usualmente Recharts)
 * @returns Contenedor estandarizado de visualización
 */
export const TarjetaGrafico: React.FC<TarjetaGraficoProps> = ({
  titulo,
  subtitulo,
  icono,
  colorIcono = 'from-blue-500 to-purple-600',
  children,
  isLoading = false,
  onRefresh,
  altura = 'h-72',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // 1. Buscamos si hay algún contenedor con scroll dentro de la tarjeta
      const contenedorScroll = cardRef.current.querySelector('.overflow-y-auto') as HTMLDivElement | null;
      
      // Obtenemos la altura total del scroll (scrollHeight) si existe
      const alturaScrollReal = contenedorScroll ? contenedorScroll.scrollHeight : 0;

      // 2. Creamos un identificador temporal único para encontrar esta tarjeta exacta en el clon del DOM
      const tempId = `descarga-grafico-${Date.now()}`;
      cardRef.current.id = tempId;

      // 3. Renderizamos la tarjeta con html2canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        // Usamos la función onclone para modificar la copia del DOM que hace html2canvas
        // de esta forma, no alteramos visualmente lo que el usuario ve en su pantalla
        onclone: (documentoClonado) => {
          const tarjetaClonada = documentoClonado.getElementById(tempId);
          if (tarjetaClonada && alturaScrollReal > 0) {
            // Buscamos el contenedor de altura fija y el contenedor de scroll en el clon
            const contenedorContenidoClon = tarjetaClonada.querySelector('.chart-content-container') as HTMLDivElement | null;
            const contenedorScrollClon = tarjetaClonada.querySelector('.overflow-y-auto') as HTMLDivElement | null;

            // Expandimos las alturas al tamaño real del gráfico para que quepa todo entero sin recortar
            if (contenedorContenidoClon) {
              contenedorContenidoClon.style.height = `${alturaScrollReal}px`;
              contenedorContenidoClon.style.minHeight = `${alturaScrollReal}px`;
            }
            if (contenedorScrollClon) {
              contenedorScrollClon.style.height = `${alturaScrollReal}px`;
              contenedorScrollClon.style.minHeight = `${alturaScrollReal}px`;
              contenedorScrollClon.style.overflow = 'visible'; // Hacemos visible el desbordamiento
              contenedorScrollClon.style.overflowY = 'visible';
            }
          }
        }
      });

      // 4. Creamos el enlace de descarga para guardar la imagen PNG
      const link = document.createElement('a');
      link.download = `grafico-${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      // 5. Limpiamos el ID temporal del elemento real del DOM
      cardRef.current.removeAttribute('id');
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icono && (
            <div className={`size-9 rounded-xl bg-gradient-to-br ${colorIcono} flex items-center justify-center text-white shadow-sm shrink-0`}>
              {icono}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{titulo}</h3>
            {subtitulo && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitulo}</p>}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-1" data-html2canvas-ignore="true">
          <button
            onClick={handleDownload}
            title="Descargar como imagen"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-150"
          >
            <Download className="size-4" />
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Actualizar gráfico"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150"
            >
              <RefreshCw className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className={`${altura} w-full relative flex items-center justify-center chart-content-container`}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="size-7 animate-spin text-blue-400" />
            <span className="text-xs">Cargando datos…</span>
          </div>
        ) : (
          <div className="size-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
