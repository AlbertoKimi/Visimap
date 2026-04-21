import React from 'react';
import { BotMessageSquare, Sparkles, Construction } from 'lucide-react';

export const ChatIA: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      {/* Cabecera de la sección */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <BotMessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base leading-tight">Análisis con Inteligencia Artificial</h3>
          <p className="text-blue-100 text-xs mt-0.5">Pide gráficos personalizados en lenguaje natural</p>
        </div>
        <div className="ml-auto">
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* Área del placeholder */}
      <div className="p-8 flex flex-col items-center justify-center gap-5 min-h-[280px] bg-gradient-to-b from-slate-50 to-white">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-inner">
          <Construction className="w-10 h-10 text-slate-400" />
        </div>

        <div className="text-center max-w-md">
          <p className="text-slate-700 font-semibold text-base">Sección en desarrollo</p>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            Aquí podrás escribir en lenguaje natural para obtener gráficos a medida.
            Por ejemplo: <em className="text-blue-500">"Muéstrame los visitantes de Madrid los últimos 3 meses"</em>.
          </p>
        </div>

        {/* Mockup de input (puramente visual) */}
        <div className="w-full max-w-lg flex gap-2 opacity-40 pointer-events-none select-none">
          <div className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-white shadow-sm">
            Escribe tu pregunta aquí...
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow">
            Enviar
          </button>
        </div>

        {/* Badge de estado */}
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Construction className="w-3 h-3" />
          Próximamente en otra rama
        </span>
      </div>
    </div>
  );
};
