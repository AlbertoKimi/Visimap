import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Pais } from "@/interfaces/Visitor";
import { PROVINCIAS } from "@/constantes/appConstants";

const visitorRepo = RepositoryFactory.getVisitorRepository();

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

  const [paises, setPaises] = useState<Pais[]>([]);
  const [loadingPaises, setLoadingPaises] = useState(true);

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData(prev => ({ ...prev, provincia: provinciaInicial }));
  }, [provinciaInicial]);

  useEffect(() => {
    const cargarPaises = async () => {
      try {
        const data = await visitorRepo.getAllPaises();
        setPaises(data);

      } catch (error) {
        console.error("Error al cargar países:", error);
      } finally {
        setLoadingPaises(false);
      }
    };
    cargarPaises();
  }, []);

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

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const esEspana = formData.pais?.trim().toLowerCase() === 'españa';

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-none space-y-4">
        <div>
          <label className="block text-[11px] font-black text-slate-800 uppercase tracking-widest mb-2 ml-1">Tipo de Visita</label>
          <div className="flex justify-center items-center gap-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, tipoVisita: 'individual', numPersonas: 1 })}
              className={`flex-col h-13 w-32 gap-1 p-1 border transition-all rounded-2xl ${formData.tipoVisita === 'individual'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105 hover:bg-blue-50 hover:text-blue-700 hover:scale-105'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-105 hover:shadow-sm'
                }`}
            >
              <User className="size-5" />
              <span className="text-sm font-bold">Individual</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, tipoVisita: 'grupo', numPersonas: 2 })}
              className={`flex-col h-13 w-32 gap-1 p-1 border transition-all rounded-2xl ${formData.tipoVisita === 'grupo'
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md scale-105 hover:bg-purple-50 hover:text-purple-700 hover:scale-105'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-105 hover:shadow-sm'
                }`}
            >
              <Users className="size-5" />
              <span className="text-sm font-bold">Grupo</span>
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

        <Select
          label="País"
          name="pais"
          value={formData.pais}
          options={paises.map(p => ({ value: p.nombre_pais, label: p.nombre_pais }))}
          manejarCambio={manejarCambio}
          required
          disabled={loadingPaises}
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

      {mostrarObservaciones && (
        <div className="flex-1">
          <TextArea
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            manejarCambio={manejarCambio}
            required={false}
            placeholder="Escribe aquí notas adicionales..."
            rows={1}
          />
        </div>
      )}

      <div className="flex gap-3 pt-1 mt-auto">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="flex-1 h-11 text-sm font-bold text-slate-600 hover:text-slate-800"
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
