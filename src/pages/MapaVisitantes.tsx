import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Formulario } from "@/components/app/Formulario";
import SpainProvincesMap from "@/components/app/SpainProvinciasMapa";
import { Snackbar, Alert } from '@mui/material';
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { useAuthStore } from "@/stores/authStore";
import { RegistroVisitante } from "@/interfaces/Visitor";

const visitorRepo = RepositoryFactory.getVisitorRepository();

interface MapaVisitantesProps {
  onRegistrarVisitante?: () => void;
}

export function MapaVisitantes({ onRegistrarVisitante }: MapaVisitantesProps) {
  const { user } = useAuthStore();
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [resetLateralTrigger, setResetLateralTrigger] = useState(0);
  const [resetModalTrigger, setResetModalTrigger] = useState(0);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    open: boolean,
    mensaje: string,
    tipo: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  const handleCerrarNotificacion = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotificacion({ ...notificacion, open: false });
  };

  const mostrarNotificacion = (mensaje: string, tipo: any = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const clickProvincia = (province: any) => {
    setSelectedProvince(province);
    setShowForm(true);
  };

  const handleRegistroVisitante = async (formData: any) => {
    if (formData.tipoVisita === 'grupo' && formData.numPersonas < 2) {
      mostrarNotificacion('Un grupo debe tener al menos 2 personas.', 'error');
      return false;
    }

    try {
      if (!user) {
        mostrarNotificacion('Debes iniciar sesión para registrar visitantes.', 'warning');
        return false;
      }

      const paisData = await visitorRepo.getPaisByName(formData.pais);
      if (!paisData) {
        mostrarNotificacion(`El país "${formData.pais}" no existe en la base de datos.`, 'error');
        return false;
      }

      let provinciaId: number | null = null;
      if (formData.provincia && formData.provincia.trim() !== '') {
        const provData = await visitorRepo.getProvinciaByName(formData.provincia);
        if (provData) {
          provinciaId = provData.id_provincia;
        } else {
          mostrarNotificacion(`La provincia "${formData.provincia}" no es válida.`, 'error');
          return false;
        }
      }

      const dataToInsert: RegistroVisitante = {
        id_pais: paisData.id_pais,
        id_provincia: provinciaId,
        id_usuario: user.id,
        cantidad: formData.numPersonas,
        tipo_visita: formData.tipoVisita,
        observaciones: formData.observaciones || null
      };

      await visitorRepo.createRegistro(dataToInsert);

      mostrarNotificacion('¡Visita registrada correctamente!', 'success');

      if (onRegistrarVisitante) onRegistrarVisitante();
      setShowForm(false);
      setSelectedProvince(null);
      return true;

    } catch (err: any) {
      console.error("Error al registrar:", err);
      let mensajeAmigable = 'Ha ocurrido un error inesperado al registrar la visita.';

      const errorMessage = err.message || '';
      if (errorMessage.includes('chk_coherencia_pais_provincia')) {
        mensajeAmigable = 'Si seleccionas una provincia española, el país debe ser España.';
      } else if (errorMessage) {
        // Si hay un mensaje de error técnico pero no es el de arriba, lo mostramos traducido si es posible
        mensajeAmigable = `Error: ${errorMessage}`;
      }

      mostrarNotificacion(mensajeAmigable, 'error');
      return false;
    }
  };

  const handleRegistroLateral = async (formData: any) => {
    const success = await handleRegistroVisitante(formData);
    if (success) setResetLateralTrigger(prev => prev + 1);
  };

  const handleRegistroModal = async (formData: any) => {
    const success = await handleRegistroVisitante(formData);
    if (success) setResetModalTrigger(prev => prev + 1);
  };

  // Contenido del formulario para reutilizar en móvil y escritorio
  const contenidoFormulario = (
    <div className="p-[var(--spacing-sm)] md:p-[var(--spacing-md)] flex flex-col h-full">
      <div className="flex items-start justify-between mb-[var(--spacing-xs)] md:mb-[var(--spacing-sm)]">
        <div className="w-full text-center md:text-left">
          <h3 className="text-[var(--font-size-xl)] md:text-[var(--font-size-2xl)] font-black text-slate-900 dark:text-white tracking-tight leading-tight">Registro Internacional</h3>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5 opacity-80">Visitantes fuera de mapa</p>
        </div>
        {/* La X solo se muestra en escritorio */}
        <button
          onClick={() => setEstaAbierto(false)}
          className="hidden md:flex p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <Formulario
          onSubmit={handleRegistroLateral}
          mostrarObservaciones={true}
          resetTrigger={resetLateralTrigger}
        />
      </div>
    </div>
  );

  return (
    <div className="flex w-full relative overflow-hidden items-stretch h-full bg-slate-50 dark:bg-slate-950">
      {/* Vista de Mapa - Solo en escritorio/tablet */}
      <div className="hidden md:block flex-1 min-w-0 relative transition-all duration-300 ease-in-out">
        <SpainProvincesMap
          activeId={selectedProvince?.id}
          onProvinceClick={clickProvincia}
        />
      </div>

      {/* Backdrop para Tablet (MD hasta LG) */}
      <AnimatePresence>
        {estaAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEstaAbierto(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Vista de Formulario en MÓVIL */}
      <div className="md:hidden w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 z-40 flex justify-center">
        <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 min-h-full shadow-2xl overflow-hidden">
          {contenidoFormulario}
        </div>
      </div>

      {/* Vista de Formulario en DESKTOP / TABLET (Panel Lateral) */}
      <motion.div
        initial={false}
        animate={{ width: estaAbierto ? 'var(--panel-width)' : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="hidden md:block absolute lg:relative right-0 top-0 bottom-0 bg-white dark:bg-slate-900 shadow-2xl flex-shrink-0 z-40 border-l border-slate-100 dark:border-slate-800 md:[--panel-width:350px] lg:[--panel-width:400px]"
      >
        <button
          onClick={() => setEstaAbierto(!estaAbierto)}
          className="absolute top-1/2 left-0 md:-left-4 lg:left-0 md:translate-x-0 lg:-translate-x-full -translate-y-1/2 p-2 bg-white dark:bg-slate-900 rounded-l-2xl md:rounded-r-2xl lg:rounded-l-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 z-50 flex items-center justify-center w-10 h-16 group transition-all"
        >
          {estaAbierto ? (
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <div className="w-full lg:w-[400px] h-full overflow-hidden">
          {contenidoFormulario}
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] md:max-h-[95vh] flex flex-col overflow-hidden border dark:border-slate-800"
            >
              <div className="overflow-y-auto flex-1 px-6 md:px-5 py-6 md:py-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">Nuevo Visitante</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{selectedProvince?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  </button>
                </div>

                <Formulario
                  mostrarObservaciones={true}
                  provinciaInicial={selectedProvince?.name || ''}
                  paisInicial="España"
                  onSubmit={handleRegistroModal}
                  onCancel={() => setShowForm(false)}
                  resetTrigger={resetModalTrigger}
                  bloquearProvincia={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={handleCerrarNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="z-[100]"
      >
        <Alert
          onClose={handleCerrarNotificacion}
          severity={notificacion.tipo}
          variant="filled"
          sx={{ width: '100%', minWidth: '300px', boxShadow: 4, fontSize: '0.95rem' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
}
