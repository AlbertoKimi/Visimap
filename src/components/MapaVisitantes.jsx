import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, User, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { SpainProvincePaths } from '../lib/SpainProvinciasPaths';
import SpainProvincesMap from './SpainProvinciasMapa'; 

export function MapaVisitantes({ onRegistrarVisitante }) {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    provincia: '',
    tipoVisita: 'individual',
    numPersonas: 1,
    pais: 'España',
    observaciones: ''
  });

  const handleProvinceClick = (province) => {
    setSelectedProvince(province);
    setFormData({ ...formData, provincia: province.name });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegistrarVisitante({
        ...formData,
        fecha: new Date().toISOString(),
      });
      alert('Visitante registrado correctamente');
      setShowForm(false);
      setSelectedProvince(null);
      setFormData({
        provincia: '',
        tipoVisita: 'individual',
        numPersonas: 1,
        pais: 'España',
        observaciones: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar visitante');
    }
  };

  const provinciasArray = Object.entries(SpainProvincePaths).map(([id, data]) => ({
    id,
    ...data
  }));

  return (
    <div className="w-full">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              Registrar Visitante por Provincia
            </h2>
            <p className="text-gray-600 ml-15">Selecciona la provincia de origen del visitante</p>
          </div>

          <SpainProvincesMap 
             activeId={selectedProvince?.id} 
             onProvinceClick={handleProvinceClick}
          />
  
        </CardContent>
      </Card>

      {/* MODAL --> FORMULARIO */}

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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
               <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                           <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-gray-900">Nuevo Visitante</h3>
                           <p className="text-sm text-gray-600 mt-1 font-medium">{selectedProvince?.name}</p>
                        </div>
                     </div>
                     <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                     </button>
                  </div>

                  {/* FORMULARIO */}

                  <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Visita *</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button type="button" onClick={() => setFormData({ ...formData, tipoVisita: 'individual', numPersonas: 1 })} className={`p-5 rounded-xl border-2 transition-all ${formData.tipoVisita === 'individual' ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                              <User className={`w-8 h-8 mx-auto mb-2 ${formData.tipoVisita === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} />
                              <p className={`font-semibold ${formData.tipoVisita === 'individual' ? 'text-blue-900' : 'text-gray-600'}`}>Individual</p>
                           </button>
                           <button type="button" onClick={() => setFormData({ ...formData, tipoVisita: 'grupo' })} className={`p-5 rounded-xl border-2 transition-all ${formData.tipoVisita === 'grupo' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                              <Users className={`w-8 h-8 mx-auto mb-2 ${formData.tipoVisita === 'grupo' ? 'text-purple-600' : 'text-gray-400'}`} />
                              <p className={`font-semibold ${formData.tipoVisita === 'grupo' ? 'text-purple-900' : 'text-gray-600'}`}>Grupo</p>
                           </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {formData.tipoVisita === 'grupo' && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Número de Personas *</label>
                              <input type="number" min="2" max="100" value={formData.numPersonas} onChange={(e) => setFormData({ ...formData, numPersonas: parseInt(e.target.value) })} className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-lg transition-all" placeholder="Ej: 25" />
                           </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">País de Origen *</label>
                       <input type="text" value={formData.pais} onChange={(e) => setFormData({ ...formData, pais: e.target.value })} className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all" placeholder="Ej: España, Francia..." />
                    </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                       <textarea value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none" rows="4" />
                    </div>

                    <div className="flex gap-3 pt-2">
                       <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 h-12 text-base">Cancelar</Button>
                       <Button onClick={handleSubmit} className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">Registrar Visitante</Button>
                    </div>
                  </div>

               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}