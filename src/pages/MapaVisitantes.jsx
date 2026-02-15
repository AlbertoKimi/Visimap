import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { Formulario } from '../components/Formulario';
import SpainProvincesMap from '../components/SpainProvinciasMapa';
import { supabase } from '../utils/supabaseClient';
import { Snackbar, Alert } from '@mui/material';

export function MapaVisitantes({ onRegistrarVisitante }) {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [resetLateralTrigger, setResetLateralTrigger] = useState(0);
  const [resetModalTrigger, setResetModalTrigger] = useState(0);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: '',
    tipo: 'success'
  });

  const handleCerrarNotificacion = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotificacion({ ...notificacion, open: false });
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const clickProvincia = (province) => {
    setSelectedProvince(province);
    setShowForm(true);
  };

  const handleRegistroVisitante = async (formData) => {
    console.log('=== INICIO REGISTRO ===');

    if (formData.tipoVisita === 'grupo' && formData.numPersonas < 2) {
      mostrarNotificacion('No puedes añadir menos de 2 personas como grupo.', 'error');
      return false;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        mostrarNotificacion('Debes iniciar sesión para registrar visitantes.', 'warning');
        return false;
      }

      //Puedo poner que también no coja tildes. Para ello debo crear otra columna en mi tabla Pais con el nombre sin nada
      // y debo rellenarla. La cosa es que pierdo espacio en mi base de datos. ¿merece la pena?

      //Debo de tener una constante para normalizarlo y reemplazarlo, ese nombre "limpio" lo debemos de tener en nuestra
      //base de datos. Luego en pasís y provincia, donde está ilike debo poner el nombre de la columna y ponerle esa constante
      //que he creado antes.

      const { data: paisData, error: errorPais } = await supabase
        .from('pais')
        .select('id_pais, nombre_pais')
        .ilike('nombre_pais', formData.pais.trim())
        .single();

      if (errorPais || !paisData) {
        mostrarNotificacion(`El país "${formData.pais}" no existe en la base de datos.`, 'error');
        return false;
      }

      let provinciaId = null;

      if (formData.provincia && formData.provincia.trim() !== '') {
        const { data: provData } = await supabase
          .from('provincia')
          .select('id_provincia, nombre_provincia')
          .ilike('nombre_provincia', formData.provincia.trim())
          .single();

        if (provData) {
          provinciaId = provData.id_provincia;
        } else {

          mostrarNotificacion(`La provincia "${formData.provincia}" no es válida.`, 'error');
          return false;
        }
      }

      const dataToInsert = {
        id_pais: paisData.id_pais,
        id_provincia: provinciaId,
        id_usuario: user.id,
        cantidad: formData.numPersonas,
        tipo_visita: formData.tipoVisita,
        observaciones: formData.observaciones || null
      };

      const { error } = await supabase.from('registro_visitante').insert([dataToInsert]);

      if (error) throw error;

      mostrarNotificacion('¡Visita registrada correctamente!', 'success');

      if (onRegistrarVisitante) onRegistrarVisitante();
      setShowForm(false);
      setSelectedProvince(null);
      return true;

    } catch (error) {
      console.error("Error real:", error);

      let mensajeAmigable = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

      if (error.message) {
        if (error.message.includes('chk_coherencia_pais_provincia')) {
          mensajeAmigable = 'Error: La provincia seleccionada no pertenece al país indicado.';
        }
        else if (error.message.includes('violates foreign key constraint')) {
          mensajeAmigable = 'Error de datos: El país o provincia no existen en nuestros registros.';
        }
        else if (error.message.includes('duplicate key')) {
          mensajeAmigable = 'Este registro ya existe en el sistema.';
        }
        else if (error.code === '23502') {
          mensajeAmigable = 'Faltan campos obligatorios por completar.';
        }
      }

      mostrarNotificacion(mensajeAmigable, 'error');
      return false;
    }
  };

  const handleRegistroLateral = async (formData) => {
    const success = await handleRegistroVisitante(formData);
    if (success) setResetLateralTrigger(prev => prev + 1);
  };

  const handleRegistroModal = async (formData) => {
    const success = await handleRegistroVisitante(formData);
    if (success) setResetModalTrigger(prev => prev + 1);
  };

  return (
    <div className="flex w-full relative overflow-hidden items-stretch">

      <div className="flex-1 min-w-0 relative transition-all duration-300 ease-in-out">
        <SpainProvincesMap
          activeId={selectedProvince?.id}
          onProvinceClick={clickProvincia}
        />
      </div>

      {/* Formulario lateral */}

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

      {/* MODAL */}

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
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Nuevo Visitante</h3>
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

      {/* Mensajes */}

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
          sx={{
            width: '100%',
            minWidth: '300px',
            boxShadow: 4,
            fontSize: '0.95rem'
          }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>

    </div>
  );
}