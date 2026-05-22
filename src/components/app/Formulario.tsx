import React, { useState, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ICONOS } from '@/constantes/iconos';
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { Pais } from "@/interfaces/Visitor";
import { FormData, FormularioProps } from "@/interfaces/components";
// import { PROVINCIAS } from "@/constantes/appConstants";

const visitorRepo = RepositoryFactory.getVisitorRepository();

/**
 * Formulario de Registro de Visitantes.
 * Permite capturar datos de entrada de visitantes, gestionando la distinción
 * entre visitas individuales y de grupo, selección de país y provincia.
 * Incluye lógica de animación para campos condicionales y carga de países desde el repositorio.
 * @param props - Configuraciones iniciales, manejadores de eventos y opciones de visualización.
 */
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

  const formErrors = useRef<Record<string, boolean>>({});

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

  // Si el país seleccionado cambia y deja de ser España, limpiamos el campo de provincia
  useEffect(() => {
    const esEspana = formData.pais?.trim().toLowerCase() === 'españa';
    if (!esEspana && formData.provincia !== '') {
      setFormData(prev => ({ ...prev, provincia: '' }));
    }
  }, [formData.pais, formData.provincia]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numPersonas' ? parseInt(value) || 0 : value
    }));
  };

  const manejarError = (name: string, hasError: boolean) => {
    formErrors.current[name] = hasError;
  };

  const handleSubmit = (e: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (Object.values(formErrors.current).some(v => v)) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const esEspana = formData.pais?.trim().toLowerCase() === 'españa';

  return (
    <div className="flex flex-col gap-3 min-h-full">
      <div className="flex-none space-y-2.5 md:space-y-2">
        <fieldset className="border-0 p-0 m-0">
          <legend className="block text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Tipo de Visita</legend>
          <div className="flex justify-center items-center gap-2 sm:gap-3 py-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, tipoVisita: 'individual', numPersonas: 1 }))}
              className={`flex-1 min-w-0 max-w-[160px] flex-col h-auto py-2.5 gap-1 p-2 border transition-all rounded-[var(--radius-xl)] ${formData.tipoVisita === 'individual'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md scale-[1.03] hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 hover:scale-[1.03]'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.03] hover:shadow-sm'
                }`}
            >
              <img src={ICONOS.individual} className="size-7 object-contain" alt="" />
              <span className="text-sm font-bold">Individual</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, tipoVisita: 'grupo', numPersonas: 2 }))}
              className={`flex-1 min-w-0 max-w-[160px] flex-col h-auto py-2.5 gap-1 p-2 border transition-all rounded-[var(--radius-xl)] ${formData.tipoVisita === 'grupo'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md scale-[1.03] hover:bg-purple-50 dark:hover:bg-blue-900/40 hover:text-purple-700 hover:scale-[1.03]'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.03] hover:shadow-sm'
                }`}
            >
              <img src={ICONOS.grupo} className="size-7 object-contain" alt="" />
              <span className="text-sm font-bold">Grupo</span>
            </Button>
          </div>
        </fieldset>

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
            {esEspana && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
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

        {mostrarObservaciones && (
          <div>
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
      </div>

      <div className="flex gap-3 pt-1 pb-1 px-2 mt-auto">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="flex-1 h-[42px] text-[var(--font-size-sm)] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 h-[42px] text-[var(--font-size-sm)] font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-200 dark:shadow-none rounded-[var(--radius-lg)] transition-all"
        >
          Registrar Entrada
        </Button>
      </div>
    </div>
  );
}
