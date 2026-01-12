import { useState, useEffect } from 'react';
import { SpainProvincePaths } from '../lib/SpainProvinciasPaths';

export default function SpainProvincesMap({ activeId, onProvinceClick, className = "" }) {
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
    const updateCursorPosition = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateCursorPosition);

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
    };
  }, []);

  return (
    <div className="flex p-2 justify-center items-center relative">
      <svg
        viewBox="0 -10 400 460"
        className="w-full h-[600px]"
        style={{ maxHeight: '550px' }}
      >
        {Object.entries(SpainProvincePaths).map(([id, province]) => {
            const isSelected = activeId === id;
            const isHovered = hoveredProvince?.id === id;

            return (
                <path
                    key={id}
                    d={province.path}
                    className={`transition-all duration-300 cursor-pointer ${
                    isSelected
                        ? 'fill-purple-600 stroke-purple-800'
                        : isHovered
                        ? 'fill-blue-500 stroke-blue-700'
                        : 'fill-blue-200 stroke-gray-700'
                    }`}

                    onMouseEnter={() => setHoveredProvince({ id, ...province })}
                    onMouseLeave={() => setHoveredProvince(null)}
                    onClick={() => onProvinceClick && onProvinceClick({ id, ...province })}
                />
            );
        })}
      </svg>

      {/* Mensaje sobre qué provincia es*/}
      
      {hoveredProvince && (
        <div className="absolute bg-white px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-500 z-10 pointer-events-none transition-all duration-200"
        style={{ left: cursorPosition.x-250, top: cursorPosition.y-150 }}>
          <p className="font-bold text-gray-800 text-lg">{hoveredProvince.name}</p>
          <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
             Click para seleccionar
          </p>
        </div>
      )}

    </div>
  );
}