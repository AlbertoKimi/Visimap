import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2, CheckCircle2, Plus, Edit3 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from "@/database/supabase/client";
import { PROVINCIAS, obtenerColor } from "@/constantes/appConstants";
import { formatearRangoFechas } from "@/utils/utils";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { Button } from "@/components/ui/button";
import { TipoEvento, GrupoVisitante } from "@/interfaces/Evento";
import { Pais } from "@/interfaces/Visitor";
import { RepositoryFactory } from "@/database/RepositoryFactory";

const visitorRepo = RepositoryFactory.getVisitorRepository();

interface EventModalProps {
  event: any;
  isNew: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  onDelete: (event: any) => void;
  onFinalized: (id: number) => void;
  onShowError: (msg: string) => void;
  tiposEvento: TipoEvento[];
}

interface GrupoExtendio extends GrupoVisitante {
  _key: number;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isNew,
  onClose,
  onSave,
  onDelete,
  onFinalized,
  onShowError,
  tiposEvento
}) => {
  const [formulario, setFormulario] = useState({
    nombre_evento: event?.nombre_evento || '',
    id_tipo: event?.id_tipo || tiposEvento[0]?.id_tipo || '',
    descripcion: event?.descripcion || '',
    fecha_inicio: event?.fecha_inicio || '',
    fecha_fin: event?.fecha_fin || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [editando, setEditando] = useState(isNew);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const [grupos, setGrupos] = useState<GrupoExtendio[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [finalizado, setFinalizado] = useState(event?.finalizado || false);
  const [enProcesoFinalizacion, setEnProcesoFinalizacion] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(event?.confirmarAlAbrir || false);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loadingPaises, setLoadingPaises] = useState(true);

  const grupoVacio = (): GrupoExtendio => ({
    _key: Date.now() + Math.random(),
    id_evento: event?.id_evento || 0,
    tipo_origen: 'provincia',
    origen: '',
    num_visitantes: 0
  });

  // Bloquear el scroll del Layout principal al abrir el modal
  useEffect(() => {
    const mainScroll = document.getElementById('dashboard-scroll-container');
    const originalBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    if (mainScroll) {
      mainScroll.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow || 'auto';
      if (mainScroll) {
        mainScroll.style.overflow = 'auto';
      }
    };
  }, []);

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

    if (!isNew && event?.id_evento) {
      setCargandoGrupos(true);
      supabase
        .from('grupo_visitante')
        .select('id_grupo, origen, tipo_origen, num_visitantes')
        .eq('id_evento', event.id_evento)
        .order('id_grupo')
        .then(({ data }) => {
          if (data) setGrupos(data.map((g: any) => ({ ...g, _key: g.id_grupo })));
          setCargandoGrupos(false);
        });
    }
  }, [isNew, event?.id_evento]);

  const totalVisitantes = grupos.reduce((acc, g) => acc + (Number(g.num_visitantes) || 0), 0);

  const añadirGrupo = () => setGrupos(gs => [...gs, grupoVacio()]);
  const eliminarGrupo = (key: number) => setGrupos(gs => gs.filter(g => g._key !== key));
  const actualizarGrupo = (key: number, campo: string, valor: any) =>
    setGrupos(gs => gs.map(g => g._key === key ? { ...g, [campo]: valor } : g));

  const handleFinalizar = async () => {
    if (!confirmarCierre) {
      setConfirmarCierre(true);
      return;
    }
    setEnProcesoFinalizacion(true);
    try {
      const { error } = await supabase
        .from('evento')
        .update({ finalizado: true })
        .eq('id_evento', event.id_evento);

      if (error) throw error;

      setFinalizado(true);
      onFinalized(event.id_evento);
    } catch (err: any) {
      onShowError(`No se pudo completar la acción: ${err.message}`);
    } finally {
      setEnProcesoFinalizacion(false);
    }
  };

  const tipoActual = tiposEvento.find(t => t.id_tipo === Number(formulario.id_tipo));
  const color = obtenerColor(tipoActual?.nombre || '');

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormulario(f => ({ ...f, [name]: value }));
  };

  const manejarError = (name: string, hasError: boolean) => {
    setFormErrors(prev => ({ ...prev, [name]: hasError }));
  };

  const handleGuardar = async () => {
    if (!formulario.nombre_evento.trim()) return setErrorLocal('El nombre es obligatorio.');
    if (!formulario.id_tipo) return setErrorLocal('Selecciona un tipo de evento.');
    if (!formulario.fecha_inicio || !formulario.fecha_fin) return setErrorLocal('Las fechas son obligatorias.');
    if (new Date(formulario.fecha_fin) <= new Date(formulario.fecha_inicio)) return setErrorLocal('La fecha de fin debe ser posterior a la de inicio.');

    if (Object.values(formErrors).some(v => v)) {
      return setErrorLocal('Por favor, corrige los errores en el formulario.');
    }

    for (const g of grupos) {
      if (!g.origen.trim()) return setErrorLocal('Indica la procedencia de cada grupo de visitantes.');
      if (!Number(g.num_visitantes) || Number(g.num_visitantes) <= 0)
        return setErrorLocal('El número de visitantes debe ser mayor que 0.');
    }
    setErrorLocal('');
    setGuardando(true);

    const gruposLimpios = grupos
      .filter(g => g.origen.trim() && Number(g.num_visitantes) > 0)
      .map(g => ({
        tipo_origen: g.tipo_origen,
        origen: g.origen.trim(),
        num_visitantes: Number(g.num_visitantes)
      }));

    try {
      await onSave({
        ...event,
        ...formulario,
        id_tipo: Number(formulario.id_tipo),
        grupos: gruposLimpios
      });

      if (event.confirmarAlAbrir) {
        setEditando(false);
        setConfirmarCierre(true);
      } else {
        onClose();
      }
    } catch (err: any) {
      const errorMessage = err.message || '';
      let msg = 'No se ha podido guardar el evento.';
      if (errorMessage.includes('chk_coherencia_pais_provincia')) {
        msg = 'Si seleccionas una provincia española, el país debe ser España.';
      } else if (errorMessage) {
        msg = `Error: ${errorMessage}`;
      }
      onShowError(msg);
    } finally {
      setGuardando(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 px-6 py-7 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold capitalize border"
                style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
              >
                {tipoActual?.nombre || '—'}
              </span>
              {!isNew && (
                finalizado
                  ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">Finalizado</span>
                  : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">En curso</span>
              )}
              {!isNew && !editando && !finalizado && !confirmarCierre && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditando(true)}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-7 w-7"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-300 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {confirmarCierre ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-2">
                  ¿Finalizar este evento?
                </h4>
                <p className="text-amber-700 dark:text-amber-500 text-xs leading-relaxed">
                  Revisa que la información sea correcta. Una vez finalizado, el evento aparecerá como completado en el sistema.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Evento</p>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold">{formulario.nombre_evento}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tipo</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium capitalize">{tipoActual?.nombre || '—'}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Visitantes</p>
                    <p className="text-slate-700 dark:text-white font-bold text-lg">{totalVisitantes}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Desglose de visitantes</p>
                  {grupos.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {grupos.map(g => (
                        <div key={g._key} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>{g.origen}</span>
                          <span className="font-medium dark:text-slate-300">{g.num_visitantes} pers.</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1">No se han registrado visitantes.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleFinalizar}
                  disabled={enProcesoFinalizacion}
                  className="w-full flex items-center justify-center gap-2 px-6 py-6 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-60"
                >
                  {enProcesoFinalizacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {enProcesoFinalizacion ? 'Confirmando...' : 'Sí, confirmar y finalizar'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setConfirmarCierre(false); setEditando(true); }}
                  className="w-full px-6 py-6 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-900/30"
                >
                  Modificar datos por si acaso
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmarCierre(false)}
                  className="w-full px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Volver atrás
                </Button>
              </div>
            </div>
          ) : (
            <>
              {editando ? (
                <Input
                  label="Nombre del evento"
                  name="nombre_evento"
                  value={formulario.nombre_evento}
                  manejarCambio={manejarCambio}
                  manejarError={manejarError}
                  required
                  placeholder="Ej: Visita Escolar"
                />
              ) : (
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 tracking-tight">{formulario.nombre_evento}</h3>
              )}

              <div className="space-y-5 text-sm text-slate-600 dark:text-slate-400 pt-2">
                {editando && (
                  <Select
                    label="Tipo de evento"
                    name="id_tipo"
                    value={formulario.id_tipo}
                    manejarCambio={manejarCambio}
                    options={tiposEvento.map(t => ({ value: t.id_tipo, label: t.nombre }))}
                    required
                  />
                )}

                {editando ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Inicio"
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formulario.fecha_inicio}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      required
                    />
                    <Input
                      label="Fin"
                      type="datetime-local"
                      name="fecha_fin"
                      value={formulario.fecha_fin}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      required
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-slate-700 dark:text-slate-200 font-medium">
                    <span>{formatearRangoFechas(formulario.fecha_inicio, formulario.fecha_fin)}</span>
                  </div>
                )}

                {editando ? (
                  <TextArea
                    label="Descripción"
                    name="descripcion"
                    value={formulario.descripcion}
                    manejarCambio={manejarCambio}
                    placeholder="Detalles sobre el evento..."
                    rows={2}
                  />
                ) : (
                  <div className="flex items-start">
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{formulario.descripcion || <span className="italic text-slate-300 dark:text-slate-600 font-light">Sin descripción detallada</span>}</p>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                      VISITANTES
                      {totalVisitantes > 0 && (
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                          {totalVisitantes} total
                        </span>
                      )}
                    </div>
                    {editando && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={añadirGrupo}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors h-7"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir grupo
                      </Button>
                    )}
                  </div>

                  {cargandoGrupos ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando...
                    </div>
                  ) : grupos.length === 0 ? (
                    <p className="text-xs text-slate-300 dark:text-slate-600 italic">
                      {editando ? 'Pulsa «Añadir grupo» para registrar visitantes.' : 'Sin visitantes registrados.'}
                    </p>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {grupos.map(g => (
                        <div key={g._key} className="space-y-3 pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 relative">
                          {editando ? (
                            <>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => actualizarGrupo(g._key, 'tipo_origen', 'provincia')}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${g.tipo_origen === 'provincia' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}
                                >
                                  🇪🇸 España
                                </button>
                                <button
                                  type="button"
                                  onClick={() => actualizarGrupo(g._key, 'tipo_origen', 'pais')}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${g.tipo_origen === 'pais' ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}
                                >
                                  🌍 Internacional
                                </button>
                              </div>
                              <div className="flex gap-2 items-start">
                                <div className="flex-1">
                                  {g.tipo_origen === 'provincia' ? (
                                    <Select
                                      label="Provincia"
                                      name={`origen-${g._key}`}
                                      value={g.origen}
                                      options={PROVINCIAS.map(p => ({ value: p, label: p }))}
                                      manejarCambio={(e) => actualizarGrupo(g._key, 'origen', e.target.value)}
                                      required
                                    />
                                  ) : (
                                    <Select
                                      label="País"
                                      name={`origen-${g._key}`}
                                      value={g.origen}
                                      options={paises.map(p => ({ value: p.nombre_pais, label: p.nombre_pais }))}
                                      manejarCambio={(e) => actualizarGrupo(g._key, 'origen', e.target.value)}
                                      required
                                      disabled={loadingPaises}
                                    />
                                  )}
                                </div>
                                <div className="w-24">
                                  <Input
                                    label="Nº"
                                    type="number"
                                    name={`num-${g._key}`}
                                    value={g.num_visitantes}
                                    manejarCambio={(e) => actualizarGrupo(g._key, 'num_visitantes', e.target.value)}
                                    required
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => eliminarGrupo(g._key)}
                                  className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-500 transition-colors shrink-0 mt-6"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <span className="capitalize">{g.origen}</span>
                                <span className="text-slate-300 dark:text-slate-600 text-[10px]">({g.tipo_origen})</span>
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{g.num_visitantes} pers.</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {errorLocal && <p className="text-red-500 dark:text-red-400 text-xs mt-3 font-medium bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">{errorLocal}</p>}

              <div className="flex justify-between mt-4 gap-3 flex-wrap">
                {!isNew && (
                  <Button
                    variant="ghost"
                    onClick={() => onDelete(event)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </Button>
                )}
                <div className="flex gap-2 ml-auto flex-wrap">
                  {!isNew && !editando && !finalizado && (
                    <Button
                      variant="ghost"
                      onClick={handleFinalizar}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-100 dark:border-emerald-900/30"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Finalizar evento
                    </Button>
                  )}
                  {editando && (
                    <Button
                      onClick={handleGuardar}
                      disabled={guardando}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                      {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
