import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, User, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { SpainMapSVG, SpainMapPaths } from './SpainMapSVG';

export function MapaVisitantes({ onRegistrarVisitante }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    comunidad: '',
    tipoVisita: 'individual',
    numPersonas: 1,
    pais: 'España',
    observaciones: ''
  });

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    setFormData({ ...formData, comunidad: region.name });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onRegistrarVisitante({
        ...formData,
        fecha: new Date().toISOString(),
      });

      // Mostrar mensaje de éxito
      alert('✅ Visitante registrado correctamente');

      // Resetear formulario
      setShowForm(false);
      setSelectedRegion(null);
      setFormData({
        comunidad: '',
        tipoVisita: 'individual',
        numPersonas: 1,
        pais: 'España',
        observaciones: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al registrar visitante');
    }
  };

  const comunidadesArray = Object.entries(SpainMapPaths).map(([id, data]) => ({
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
              Registrar Visitante por Comunidad
            </h2>
            <p className="text-gray-600 ml-15">Selecciona la comunidad autónoma de origen del visitante</p>
          </div>

          {/* Mapa SVG Interactivo */}
          <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-inner">
            <SpainMapSVG
              onRegionHover={setHoveredRegion}
              onRegionLeave={() => setHoveredRegion(null)}
              onRegionClick={handleRegionClick}
              hoveredRegion={hoveredRegion}
              selectedRegion={selectedRegion}
            />

            {/* Tooltip flotante al hacer hover */}
            <AnimatePresence>
              {hoveredRegion && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-500 z-10"
                >
                  <p className="font-bold text-gray-800 text-lg">{hoveredRegion.name}</p>
                  <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    Click para registrar visitante
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leyenda */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg text-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-200 border-2 border-gray-600 rounded"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-400 border-2 border-blue-600 rounded"></div>
                <span>Hover</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 border-2 border-purple-800 rounded"></div>
                <span>Seleccionado</span>
              </div>
            </div>
          </div>

          {/* Lista alternativa desplegable */}
          <details className="mt-6 bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold text-gray-700 flex items-center gap-2">
              📋 Ver lista completa de comunidades
            </summary>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
              {comunidadesArray.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionClick(region)}
                  className={`p-3 text-sm rounded-lg transition-all border-2 text-left ${
                    selectedRegion?.id === region.id
                      ? 'bg-purple-100 border-purple-500 font-bold'
                      : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Modal con Formulario */}
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
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Nuevo Visitante</h3>
                      <p className="text-sm text-gray-600 mt-1 font-medium">{selectedRegion?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Tipo de visita */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Tipo de Visita *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVisita: 'individual', numPersonas: 1 })}
                        className={`p-5 rounded-xl border-2 transition-all ${
                          formData.tipoVisita === 'individual'
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <User className={`w-8 h-8 mx-auto mb-2 ${
                          formData.tipoVisita === 'individual' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          formData.tipoVisita === 'individual' ? 'text-blue-900' : 'text-gray-600'
                        }`}>Individual</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVisita: 'grupo' })}
                        className={`p-5 rounded-xl border-2 transition-all ${
                          formData.tipoVisita === 'grupo'
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Users className={`w-8 h-8 mx-auto mb-2 ${
                          formData.tipoVisita === 'grupo' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          formData.tipoVisita === 'grupo' ? 'text-purple-900' : 'text-gray-600'
                        }`}>Grupo</p>
                      </button>
                    </div>
                  </div>

                  {/* Número de personas (solo si es grupo) */}
                  <AnimatePresence>
                    {formData.tipoVisita === 'grupo' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Número de Personas *
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="100"
                          value={formData.numPersonas}
                          onChange={(e) => setFormData({ ...formData, numPersonas: parseInt(e.target.value) })}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-lg transition-all"
                          placeholder="Ej: 25"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Entre 2 y 100 personas</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* País */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      País de Origen *
                    </label>
                    <input
                      type="text"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg transition-all"
                      placeholder="Ej: España, Francia, Alemania..."
                      required
                    />
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
                      rows="4"
                      placeholder="Notas adicionales sobre el visitante o grupo..."
                    />
                  </div>

                  {/* Resumen */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">📋 Resumen del Registro:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• <strong>Comunidad:</strong> {selectedRegion?.name}</li>
                      <li>• <strong>Tipo:</strong> {formData.tipoVisita === 'individual' ? 'Individual' : `Grupo de ${formData.numPersonas} personas`}</li>
                      <li>• <strong>País:</strong> {formData.pais || 'No especificado'}</li>
                      <li className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES')}
                      </li>
                    </ul>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1 h-12 text-base"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    >
                      Registrar Visitante
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}