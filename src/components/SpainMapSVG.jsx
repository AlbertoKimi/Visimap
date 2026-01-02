export const SpainMapPaths = {
  galicia: {
    name: 'Galicia',
    path: 'M 34.8 15.7 L 60 20 L 85 25 L 110 30 L 120 50 L 110 70 L 85 75 L 60 70 L 35 65 L 20 50 Z'
  },
  asturias: {
    name: 'Principado de Asturias',
    path: 'M 120 50 L 180 55 L 200 65 L 190 85 L 160 90 L 130 85 L 110 70 Z'
  },
  cantabria: {
    name: 'Cantabria',
    path: 'M 200 65 L 250 70 L 260 80 L 250 95 L 220 100 L 190 85 Z'
  },
  paisvasco: {
    name: 'País Vasco',
    path: 'M 260 80 L 310 85 L 320 95 L 310 110 L 280 115 L 250 95 Z'
  },
  navarra: {
    name: 'Comunidad Foral de Navarra',
    path: 'M 310 85 L 360 90 L 370 105 L 360 125 L 330 130 L 310 110 Z'
  },
  larioja: {
    name: 'La Rioja',
    path: 'M 310 110 L 360 115 L 365 130 L 350 145 L 320 140 L 310 125 Z'
  },
  aragon: {
    name: 'Aragón',
    path: 'M 360 125 L 450 140 L 470 180 L 460 220 L 420 235 L 380 225 L 350 200 L 340 160 Z'
  },
  cataluna: {
    name: 'Cataluña',
    path: 'M 450 140 L 540 150 L 550 190 L 530 230 L 490 240 L 460 220 L 470 180 Z'
  },
  castillayleon: {
    name: 'Castilla y León',
    path: 'M 130 85 L 280 115 L 350 145 L 360 200 L 340 260 L 280 280 L 200 270 L 140 250 L 100 200 L 110 140 Z'
  },
  madrid: {
    name: 'Comunidad de Madrid',
    path: 'M 280 240 L 330 245 L 340 270 L 320 295 L 280 290 L 260 270 Z'
  },
  castillamancha: {
    name: 'Castilla-La Mancha',
    path: 'M 200 270 L 340 260 L 410 280 L 420 330 L 380 370 L 310 380 L 240 370 L 180 340 L 170 300 Z'
  },
  extremadura: {
    name: 'Extremadura',
    path: 'M 100 200 L 200 270 L 180 340 L 160 380 L 110 390 L 60 360 L 50 300 L 70 240 Z'
  },
  andalucia: {
    name: 'Andalucía',
    path: 'M 160 380 L 310 380 L 380 390 L 450 410 L 460 450 L 420 480 L 350 485 L 270 480 L 190 465 L 130 440 L 110 410 Z'
  },
  murcia: {
    name: 'Región de Murcia',
    path: 'M 380 370 L 450 375 L 470 395 L 465 425 L 430 440 L 390 430 L 370 405 Z'
  },
  valencia: {
    name: 'Comunidad Valenciana',
    path: 'M 410 280 L 490 290 L 520 320 L 525 370 L 500 410 L 450 410 L 420 380 L 410 330 Z'
  },
  baleares: {
    name: 'Islas Baleares',
    path: 'M 560 320 L 590 325 L 600 340 L 595 360 L 575 370 L 545 365 L 540 345 Z'
  },
  canarias: {
    name: 'Canarias',
    path: 'M 30 500 L 60 505 L 85 502 L 95 515 L 85 530 L 55 535 L 25 530 Z M 110 510 L 145 513 L 165 508 L 175 520 L 165 535 L 135 540 L 105 535 Z'
  },
  ceuta: {
    name: 'Ceuta',
    path: 'M 240 505 L 255 508 L 260 518 L 252 528 L 235 525 Z'
  },
  melilla: {
    name: 'Melilla',
    path: 'M 450 485 L 465 488 L 470 498 L 462 508 L 445 505 Z'
  }
};

export function SpainMapSVG({ onRegionHover, onRegionLeave, onRegionClick, hoveredRegion, selectedRegion }) {
  return (
    <svg 
      viewBox="0 0 650 560" 
      className="w-full h-auto"
      style={{ maxHeight: '600px' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {Object.entries(SpainMapPaths).map(([id, region]) => (
        <path
          key={id}
          d={region.path}
          className={`transition-all duration-300 cursor-pointer ${
            selectedRegion?.id === id
              ? 'fill-purple-600 stroke-purple-800'
              : hoveredRegion?.id === id
              ? 'fill-blue-500 stroke-blue-700'
              : 'fill-blue-200 stroke-gray-700'
          }`}
          strokeWidth="2"
          style={{
            filter: (hoveredRegion?.id === id || selectedRegion?.id === id) ? 'url(#glow)' : 'none'
          }}
          onMouseEnter={() => onRegionHover({ id, ...region })}
          onMouseLeave={onRegionLeave}
          onClick={() => onRegionClick({ id, ...region })}
        />
      ))}
    </svg>
  );
}