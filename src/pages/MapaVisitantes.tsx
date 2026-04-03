import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Formulario } from '../components/Formulario';
import SpainProvincesMap from '../components/SpainProvinciasMapa';
import { Snackbar, Alert } from '@mui/material';
import { RepositoryFactory } from '../database/RepositoryFactory';
import { useAuthStore } from '../stores/authStore';
import { RegistroVisitante } from '../interfaces/Visitor';

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
      mostrarNotificacion('No puedes añadir menos de 2 personas como grupo.', 'error');
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
      let mensajeAmigable = 'Ocurrió un error inesperado: ' + err.message;
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

  return (
    <div className="flex w-full relative overflow-hidden items-stretch h-full">
      <div className="flex-1 min-w-0 relative transition-all duration-300 ease-in-out">
        <SpainProvincesMap
          activeId={selectedProvince?.id}
          onProvinceClick={clickProvincia}
        />
      </div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: estaAbierto ? 400 : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="relative bg-white shadow-xl flex-shrink-0 z-40"
      >
        <button
          onClick={() => setEstaAbierto(!estaAbierto)}
          className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 p-2 bg-white rounded-l-xl shadow-lg border-y border-l border-gray-200 text-gray-600 hover:text-blue-600 z-50 flex items-center justify-center w-10 h-14"
        >
          {estaAbierto ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className="w-[400px] h-full overflow-y-auto border-l border-gray-100">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registro Rápido</h3>
                <p className="text-sm text-gray-500">Visitante internacional</p>
              </div>
              <button onClick={() => setEstaAbierto(false)} className="md:hidden p-2 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <Formulario
                onSubmit={handleRegistroLateral}
                mostrarObservaciones={true}
                resetTrigger={resetLateralTrigger}
              />
            </div>
          </div>
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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Nuevo Visitante</h3>
                      <p className="text-sm text-blue-600 font-medium">{selectedProvince?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
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
