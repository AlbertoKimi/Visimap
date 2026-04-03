import { useState, useEffect } from 'react';
import { SpainProvincePaths } from '../utils/SpainProvinciasPaths';
import { getColoresProvincia } from '../utils/ProvinciasColores';
import { LeyendaColores } from './Leyenda';

interface ProvinceInfo {
  id: string;
  name: string;
  path: string;
}

interface SpainProvincesMapProps {
  activeId?: string | null;
  onProvinceClick?: (province: ProvinceInfo) => void;
  className?: string;
}

export default function SpainProvincesMap({ 
    activeId, 
    onProvinceClick, 
    className = "" 
}: SpainProvincesMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceInfo | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateCursorPosition);
    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
    };
  }, []);

  return (
    <div className={`flex justify-center items-center w-full h-full ${className}`}>
      <div className="relative w-full max-w-[550px]">
        <svg
          viewBox="0 -10 400 460"
          className="w-full h-auto max-h-[83vh] drop-shadow-lg"
        >
          {Object.entries(SpainProvincePaths).map(([id, province]) => {
            const isSelected = activeId === id;
            const isHovered = hoveredProvince?.id === id;
            const baseColor = getColoresProvincia(id);

            return (
              <path
                key={id}
                d={province.path}
                className={`transition-all duration-300 cursor-pointer stroke-black stroke-[0.5] ${isSelected
                  ? 'fill-purple-700 stroke-purple-900 z-10'
                  : isHovered
                    ? 'fill-blue-500 stroke-blue-300 z-10'
                    : `${baseColor} hover:opacity-90`
                  }`}
                onMouseEnter={() => setHoveredProvince({ id, ...province })}
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() => onProvinceClick && onProvinceClick({ id, ...province })}
              />
            );
          })}
        </svg>

        <LeyendaColores />
      </div>

      {hoveredProvince && (
        <div
          className="fixed bg-white/95 backdrop-blur px-4 py-2 rounded-lg shadow-xl border border-blue-100 z-50 pointer-events-none transition-opacity duration-150"
          style={{
            left: cursorPosition.x + 15,
            top: cursorPosition.y + 15
          }}
        >
          <p className="font-bold text-gray-800">{hoveredProvince.name}</p>
          <p className="text-xs text-blue-500 font-medium">Click para seleccionar</p>
        </div>
      )}
    </div>
  );
}
