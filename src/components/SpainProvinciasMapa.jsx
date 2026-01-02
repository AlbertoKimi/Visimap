import { useState } from 'react';
import { SpainProvincePaths } from '../lib/SpainProvinciasPaths';

export default function SpainProvincesMap({ activeId, onProvinceClick, className = "" }) {
  const [hoveredProvince, setHoveredProvince] = useState(null);

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-inner ${className}`}>
      
      <svg
        viewBox="0 0 600 550"
        className="w-full h-auto"
        style={{ maxHeight: '700px' }}
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-500 z-10 pointer-events-none transition-all duration-200">
          <p className="font-bold text-gray-800 text-lg">{hoveredProvince.name}</p>
          <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
             Click para seleccionar
          </p>
        </div>
      )}

    </div>
  );
}