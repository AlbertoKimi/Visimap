import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User } from 'lucide-react';
import { Button } from './button';

export function Formulario({
  provinciaInicial = '',
  paisInicial = 'España',
  onSubmit,
  onCancel,
  mostrarObservaciones = false,
  bloquearProvincia = false,
  resetTrigger = 0
}) {
  const [formData, setFormData] = useState({
    provincia: provinciaInicial,
    tipoVisita: 'individual',
    numPersonas: 1,
    pais: paisInicial,
    observaciones: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, provincia: provinciaInicial }));
  }, [provinciaInicial]);


  useEffect(() => {
    if (resetTrigger > 0) {
      setFormData({
        provincia: provinciaInicial, 
        tipoVisita: 'individual',
        numPersonas: 1,
        pais: paisInicial, 
        observaciones: ''
      });
    }
  }, [resetTrigger, provinciaInicial, paisInicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">

      <div className="flex-none space-y-3">

        {/* TIPO DE VISITA */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Visita</label>
          <div className="flex justify-center items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoVisita: 'individual', numPersonas: 1 })}
              className={`flex flex-col items-center justify-center gap-2 p-1 h-20 w-32 rounded-lg border transition-all ${formData.tipoVisita === 'individual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
            >
              <User className="size-5" />
              <span className="text-sm font-semibold">Individual</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoVisita: 'grupo' })}
              className={`flex flex-col items-center justify-center gap-2 p-1 h-20 w-32 rounded-lg border transition-all ${formData.tipoVisita === 'grupo'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
            >
              <Users className="size-5" />
              <span className="text-sm font-semibold">Grupo</span>
            </button>
          </div>
        </div>

        {/* NÚMERO DE PERSONAS */}

        <AnimatePresence>
          {formData.tipoVisita === 'grupo' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Nº Personas
              </label>
              <input
                type="number"
                min="2"
                max="500"
                value={formData.numPersonas}
                onChange={(e) => setFormData({ ...formData, numPersonas: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
                placeholder="Ej: 25"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAÍS Y PROVINCIA */}

        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">País</label>
            <input
              type="text"
              value={formData.pais}
              onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
              placeholder="España..."
            />
          </div>

          <div className="relative">
            <AnimatePresence mode='popLayout'>
              {(formData.pais === 'España' || formData.provincia) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Provincia
                  </label>
                  
                  <input
                    type="text"
                    value={formData.provincia}
                    readOnly={bloquearProvincia}
                    onChange={(e) => !bloquearProvincia && setFormData({ ...formData, provincia: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition-all ${
                      bloquearProvincia 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed focus:border-gray-300 select-none' 
                        : 'focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white'
                    }`}
                    placeholder="Ej: Madrid"
                  />

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* OBSERVACIONES */}
      
      {mostrarObservaciones && (
        <div className="flex-1 min-h-[80px] flex flex-col">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Observaciones</label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none flex-1"
            placeholder="Escribe aquí notas adicionales..."
          />
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-2 pt-2 mt-auto">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-10 text-sm"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all"
        >
          Registrar
        </Button>
      </div>
    </div>
  );
}