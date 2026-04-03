import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User } from 'lucide-react';
import { Button } from './button';
import Input from './inputs/Input';
import TextArea from './inputs/TextArea';

interface FormData {
  provincia: string;
  tipoVisita: 'individual' | 'grupo';
  numPersonas: number;
  pais: string;
  observaciones: string;
}

interface FormularioProps {
  provinciaInicial?: string;
  paisInicial?: string;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  mostrarObservaciones?: boolean;
  bloquearProvincia?: boolean;
  resetTrigger?: number;
}

export function Formulario({
  provinciaInicial = '',
  paisInicial = '',
  onSubmit,
  onCancel,
  mostrarObservaciones = false,
  bloquearProvincia = false,
  resetTrigger = 0
}: FormularioProps) {
  const [formData, setFormData] = useState<FormData>({
    provincia: provinciaInicial,
    tipoVisita: 'individual',
    numPersonas: 1,
    pais: paisInicial,
    observaciones: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

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

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numPersonas' ? parseInt(value) || 0 : value
    }));
  };

  const manejarError = (name: string, hasError: boolean) => {
    setFormErrors(prev => ({ ...prev, [name]: hasError }));
  };

  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (Object.values(formErrors).some(v => v)) {
      return; // Podríamos mostrar una notificación si quisiéramos
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const esEspana = formData.pais?.trim().toLowerCase() === 'españa';

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex-none space-y-2">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1 ml-1">Tipo de Visita</label>
          <div className="flex justify-center items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, tipoVisita: 'individual', numPersonas: 1 })}
              className={`flex-col h-14 w-32 gap-1 p-1 border transition-all hover:bg-gray-50 hover:text-gray-600 rounded-2xl ${formData.tipoVisita === 'individual'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-50 hover:text-blue-700'
                : 'border-gray-200 text-gray-600'
                }`}
            >
              <User className="size-5" />
              <span className="text-sm font-semibold">Individual</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, tipoVisita: 'grupo', numPersonas: 2 })}
              className={`flex-col h-14 w-32 gap-1 p-1 border transition-all hover:bg-gray-50 hover:text-gray-600 rounded-2xl ${formData.tipoVisita === 'grupo'
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm hover:bg-purple-50 hover:text-purple-700'
                : 'border-gray-200 text-gray-600'
                }`}
            >
              <Users className="size-5" />
              <span className="text-sm font-semibold">Grupo</span>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {formData.tipoVisita === 'grupo' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="overflow-hidden"
            >
              <Input
                label="Nº Personas"
                type="number"
                name="numPersonas"
                min="2"
                max="500"
                value={formData.numPersonas}
                manejarCambio={manejarCambio}
                manejarError={manejarError}
                required
                variant="info"
                placeholder="Ej: 25"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2">
          <Input
            label="País"
            name="pais"
            value={formData.pais}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
            placeholder="Ej: España"
          />

          <div className="relative">
            <AnimatePresence mode='popLayout'>
              {(esEspana || formData.provincia) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Input
                    label="Provincia"
                    name="provincia"
                    value={formData.provincia}
                    readOnly={bloquearProvincia}
                    disabled={bloquearProvincia}
                    manejarCambio={manejarCambio}
                    manejarError={manejarError}
                    required={esEspana}
                    variant="info"
                    placeholder="Ej: Madrid"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {mostrarObservaciones && (
        <div className="flex-1">
          <TextArea
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            manejarCambio={manejarCambio}
            required={false}
            placeholder="Escribe aquí notas adicionales..."
            rows={2}
          />
        </div>
      )}

      <div className="flex gap-3 pt-1 mt-auto">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="flex-1 h-11 text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 h-11 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-200 rounded-xl transition-all"
        >
          Registrar Entrada
        </Button>
      </div>
    </div>
  );
}
