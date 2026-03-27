import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2, CheckCircle2, Plus, Edit3 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { PROVINCIAS, obtenerColor } from '../../constantes/constantes';
import { formatearFechaInput, formatearRangoFechas } from '../../utils/utils';
import { InputField } from '../InputField';
import { Button } from '../button';

export const EventModal = ({ event, isNew, onClose, onSave, onDelete, onFinalized, onShowError, tiposEvento }) => {
  const [formulario, setFormulario] = useState({
    nombre_evento: event?.nombre_evento || '',
    id_tipo: event?.id_tipo || tiposEvento[0]?.id_tipo || '',
    descripcion: event?.descripcion || '',
    fecha_inicio: event?.fecha_inicio || '',
    fecha_fin: event?.fecha_fin || '',
  });
  const [editando, setEditando] = useState(isNew);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  // ── Grupos de visitantes ───────────────────────────────────────────────────
  const grupoVacio = () => ({ _key: Date.now() + Math.random(), tipo_origen: 'provincia', origen: '', num_visitantes: '' });
  const [grupos, setGrupos] = useState(event?.grupos || []);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [finalizado, setFinalizado] = useState(event?.finalizado || false);
  const [enProcesoFinalizacion, setEnProcesoFinalizacion] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(event?.confirmarAlAbrir || false);

  // Carga los grupos existentes cuando se abre un evento ya guardado
  useEffect(() => {
    if (!isNew && event?.id_evento) {
      setCargandoGrupos(true);
      supabase
        .from('grupo_visitante')
        .select('id_grupo, origen, tipo_origen, num_visitantes')
        .eq('id_evento', event.id_evento)
        .order('id_grupo')
        .then(({ data }) => {
          if (data) setGrupos(data.map(g => ({ ...g, _key: g.id_grupo })));
          setCargandoGrupos(false);
        });
    }
  }, [isNew, event?.id_evento]);

  const totalVisitantes = grupos.reduce((acc, g) => acc + (parseInt(g.num_visitantes) || 0), 0);

  const añadirGrupo = () => setGrupos(gs => [...gs, grupoVacio()]);
  const eliminarGrupo = (key) => setGrupos(gs => gs.filter(g => g._key !== key));
  const actualizarGrupo = (key, campo, valor) =>
    setGrupos(gs => gs.map(g => g._key === key ? { ...g, [campo]: valor } : g));

  const handleFinalizar = async () => {
    if (!confirmarCierre) {
      setConfirmarCierre(true);
      return;
    }
    setEnProcesoFinalizacion(true);
    const { error } = await supabase
      .from('evento')
      .update({ finalizado: true })
      .eq('id_evento', event.id_evento);
    setEnProcesoFinalizacion(false);
    if (error) { onShowError(`Error al finalizar: ${error.message}`); return; }
    setFinalizado(true);
    onFinalized(event.id_evento);
  };

  const handleReabrir = async () => {
    setEnProcesoFinalizacion(true);
    const { error } = await supabase
      .from('evento')
      .update({ finalizado: false })
      .eq('id_evento', event.id_evento);
    setEnProcesoFinalizacion(false);
    if (error) { onShowError(`Error al reabrir: ${error.message}`); return; }
    setFinalizado(false);
    // Necesitamos informar a la vista general para que actualice el color/estado en el calendario
    onSave({ ...event, finalizado: false });
  };

  const tipoActual = tiposEvento.find(t => t.id_tipo === Number(formulario.id_tipo));
  const color = obtenerColor(tipoActual?.nombre || '');

  const cambiarValor = (campo, valor) => setFormulario(f => ({ ...f, [campo]: valor }));

  const handleGuardar = async () => {
    if (!formulario.nombre_evento.trim()) return setErrorLocal('El nombre es obligatorio.');
    if (!formulario.id_tipo) return setErrorLocal('Selecciona un tipo de evento.');
    if (!formulario.fecha_inicio || !formulario.fecha_fin) return setErrorLocal('Las fechas son obligatorias.');
    if (new Date(formulario.fecha_fin) <= new Date(formulario.fecha_inicio)) return setErrorLocal('La fecha de fin debe ser posterior a la de inicio.');
    
    for (const g of grupos) {
      if (!g.origen.trim()) return setErrorLocal('Indica la procedencia de cada grupo de visitantes.');
      if (!parseInt(g.num_visitantes) || parseInt(g.num_visitantes) <= 0)
        return setErrorLocal('El número de visitantes debe ser mayor que 0.');
    }
    setErrorLocal('');
    setGuardando(true);
    
    const gruposLimpios = grupos
      .filter(g => g.origen.trim() && parseInt(g.num_visitantes) > 0)
      .map(g => ({ tipo_origen: g.tipo_origen, origen: g.origen.trim(), num_visitantes: parseInt(g.num_visitantes) }));
      
    await onSave({ ...event, ...formulario, id_tipo: Number(formulario.id_tipo), grupos: gruposLimpios });
    
    if (event.confirmarAlAbrir) {
      setEditando(false);
      setConfirmarCierre(true);
    }
    setGuardando(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold capitalize border"
              style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
            >
              {tipoActual?.nombre || '—'}
            </span>
            {!isNew && (
              finalizado
                ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Finalizado</span>
                : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">En curso</span>
            )}
            {!isNew && !editando && !finalizado && !confirmarCierre && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditando(true)}
                className="text-slate-400 hover:text-blue-600 transition-colors h-7 w-7"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-slate-300 hover:text-slate-600 transition-colors h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Resumen de Finalización */}
        {confirmarCierre ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h4 className="text-amber-800 font-bold mb-2">
                ¿Finalizar este evento?
              </h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Revisa que la información sea correcta. Una vez finalizado, el evento aparecerá como completado en el sistema.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Evento</p>
                <p className="text-slate-700 font-semibold">{formulario.nombre_evento}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tipo</p>
                  <p className="text-slate-700 font-medium capitalize">{tipoActual?.nombre || '—'}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitantes</p>
                  <p className="text-slate-700 font-bold text-lg">{totalVisitantes}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Desglose de visitantes</p>
                {grupos.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {grupos.map(g => (
                      <div key={g._key} className="flex justify-between text-xs text-slate-600">
                        <span>{g.origen}</span>
                        <span className="font-medium">{g.num_visitantes} pers.</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-1">No se han registrado visitantes.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={handleFinalizar}
                disabled={enProcesoFinalizacion}
                className="w-full flex items-center justify-center gap-2 px-6 py-6 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-60"
              >
                {enProcesoFinalizacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {enProcesoFinalizacion ? 'Confirmando...' : 'Sí, confirmar y finalizar'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setConfirmarCierre(false); setEditando(true); }}
                className="w-full px-6 py-6 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
              >
                Modificar datos por si acaso
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmarCierre(false)}
                className="w-full px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Volver atrás
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Nombre */}
            {editando ? (
              <InputField
                label="Nombre del evento"
                id="nombre_evento"
                value={formulario.nombre_evento}
                onChange={e => cambiarValor('nombre_evento', e.target.value)}
                placeholder="Ej: Visita Escolar"
                autoFocus
                className="text-xl font-bold !border-t-0 !border-x-0 !border-b-2 !rounded-none focus:border-blue-400 !px-0"
              />
            ) : (
              <h3 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">{formulario.nombre_evento}</h3>
            )}

            <div className="space-y-4 text-sm text-slate-600">
              {/* Tipo (solo en edición) */}
              {editando && (
                <div className="flex flex-col">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Tipo de evento</label>
                  <div className="flex items-center">
                    <select
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all capitalize text-sm"
                      value={formulario.id_tipo}
                      onChange={e => cambiarValor('id_tipo', e.target.value)}
                    >
                      <option value="">-- Selecciona un tipo --</option>
                      {tiposEvento.map(t => <option key={t.id_tipo} value={t.id_tipo} className="capitalize">{t.nombre}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Fechas */}
              {editando ? (
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Inicio"
                    type="datetime-local"
                    id="fecha_inicio"
                    value={formulario.fecha_inicio}
                    onChange={e => cambiarValor('fecha_inicio', e.target.value)}
                  />
                  <InputField
                    label="Fin"
                    type="datetime-local"
                    id="fecha_fin"
                    value={formulario.fecha_fin}
                    onChange={e => cambiarValor('fecha_fin', e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex items-center text-slate-700 font-medium">
                  <span>{formatearRangoFechas(formulario.fecha_inicio, formulario.fecha_fin)}</span>
                </div>
              )}

              {/* Descripción */}
              {editando ? (
                <InputField
                  label="Descripción"
                  isTextArea
                  rows={3}
                  id="descripcion"
                  value={formulario.descripcion}
                  onChange={e => cambiarValor('descripcion', e.target.value)}
                  placeholder="Detalles sobre el evento..."
                />
              ) : (
                <div className="flex items-start">
                  <p className="text-slate-500 leading-relaxed font-normal">{formulario.descripcion || <span className="italic text-slate-300 font-light">Sin descripción detallada</span>}</p>
                </div>
              )}

              {/* Visitantes */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    VISITANTES
                    {totalVisitantes > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {totalVisitantes} total
                      </span>
                    )}
                  </div>
                  {editando && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={añadirGrupo}
                      className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors h-7"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir grupo
                    </Button>
                  )}
                </div>

                {cargandoGrupos ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando visitantes...
                  </div>
                ) : grupos.length === 0 ? (
                  <p className="text-xs text-slate-300 italic">
                    {editando ? 'Pulsa «Añadir grupo» para registrar visitantes.' : 'Sin visitantes registrados.'}
                  </p>
                ) : editando ? (
                  <div className="space-y-2">
                    {grupos.map(g => (
                      <div key={g._key} className="space-y-1.5 pb-2 border-b border-slate-50 last:border-0">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => actualizarGrupo(g._key, 'tipo_origen', 'provincia')}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${g.tipo_origen === 'provincia' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                          >
                            🇪🇸 España
                          </button>
                          <button
                            type="button"
                            onClick={() => actualizarGrupo(g._key, 'tipo_origen', 'pais')}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${g.tipo_origen === 'pais' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                          >
                            🌍 Internacional
                          </button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <InputField
                            label={g.tipo_origen === 'provincia' ? "Provincia" : "País"}
                            list={g.tipo_origen === 'provincia' ? `prov-list-${g._key}` : undefined}
                            placeholder={g.tipo_origen === 'provincia' ? 'Ej: Badajoz' : 'Ej: Francia'}
                            value={g.origen}
                            onChange={e => actualizarGrupo(g._key, 'origen', e.target.value)}
                            containerClassName="flex-1"
                          />
                          {g.tipo_origen === 'provincia' && (
                            <datalist id={`prov-list-${g._key}`}>
                              {PROVINCIAS.map(p => <option key={p} value={p} />)}
                            </datalist>
                          )}
                          <InputField
                            label="Nº"
                            type="number"
                            min="1"
                            value={g.num_visitantes}
                            onChange={e => actualizarGrupo(g._key, 'num_visitantes', e.target.value)}
                            containerClassName="w-20"
                            className="text-center font-bold"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => eliminarGrupo(g._key)}
                            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mb-3"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {grupos.map(g => (
                      <div key={g._key} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="capitalize">{g.origen}</span>
                          <span className="text-slate-300">({g.tipo_origen === 'pais' ? 'país' : 'provincia'})</span>
                        </div>
                        <span className="font-bold text-slate-700">{g.num_visitantes} <span className="font-normal text-slate-400">pers.</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errorLocal && <p className="text-red-500 text-xs mt-3 font-medium">{errorLocal}</p>}

            {/* Acciones */}
            <div className="flex justify-between mt-6 gap-3 flex-wrap">
              {!isNew && (
                <Button
                  variant="ghost"
                  onClick={() => onDelete(event)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto flex-wrap">
                {!isNew && !editando && !finalizado && (
                  <Button
                    variant="ghost"
                    onClick={handleFinalizar}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Finalizar evento
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={onClose} 
                  className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors hidden"
                >
                  Cancelar
                </Button>
                {editando && (
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
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
  );
};
