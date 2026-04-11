import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  X,
  Camera,
  Key,
  Loader2
} from 'lucide-react';
import { Button } from '../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import Input from '../components/inputs/Input';
import Select from '../components/inputs/Select';
import { RepositoryFactory } from '../database/RepositoryFactory';
import { supabase } from '../supabase/client';
import { Perfil } from '../interfaces/Perfil';
import { Rol } from '../interfaces/Rol';

const userRepo = RepositoryFactory.getUserRepository();
const authRepo = RepositoryFactory.getAuthRepository();

interface DetalleUsuarioProps {
  user: Perfil;
  initialMode?: string;
  roles: Rol[];
  onBack: () => void;
  onUpdate: () => void;
  mostrarNotificacion: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
  hideBack?: boolean;
}

export const DetalleUsuario: React.FC<DetalleUsuarioProps> = ({
  user: initialUser,
  initialMode = 'view',
  roles,
  onBack,
  onUpdate,
  mostrarNotificacion,
  hideBack = false
}) => {
  const [mode, setMode] = useState(initialMode);
  const [user, setUser] = useState<Perfil>(initialUser);
  const [editData, setEditData] = useState<Partial<Perfil>>({ ...initialUser });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Estados para contraseñas
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para imagen pendiente (vista previa local antes de guardar)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados para datos reales
  const [realStats, setRealStats] = useState({
    eventos: 0,
    registros: 0,
    ultimaActividad: 'Sin datos'
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cargar estadísticas reales
  const fetchStats = useCallback(async () => {
    const stats = await userRepo.getStats(user.id);
    setRealStats(stats);
  }, [user.id]);

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registro_visitante' }, () => fetchStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'evento' }, () => fetchStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grupo_visitante' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  const stats = [
    { label: 'Eventos Creados', value: realStats.eventos, color: 'bg-blue-50 text-blue-600' },
    { label: 'Última Actividad', value: realStats.ultimaActividad, color: 'bg-purple-50 text-purple-600' },
    { label: 'Registros Totales', value: realStats.registros, color: 'bg-orange-50 text-orange-600' },
  ];

  useEffect(() => {
    setUser(initialUser);
    setEditData({ ...initialUser });
    setMode(initialMode);
  }, [initialUser, initialMode]);

  const handleEdit = () => {
    setMode('edit');
    setNewPassword('');
    setConfirmPassword('');
    setPendingImageFile(null);
    setPreviewUrl(null);
  };
  const handleCancel = () => {
    setMode('view');
    setEditData({ ...user });
    setNewPassword('');
    setConfirmPassword('');
    setPendingImageFile(null);
    setPreviewUrl(null);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const manejarCambioPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  const manejarError = (name: string, hasError: boolean) => {
    setFormErrors(prev => ({ ...prev, [name]: hasError }));
  };

  const handleSave = async () => {
    // Validar contraseñas
    if (newPassword) {
      if (newPassword.length < 6) {
        return mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
      }
      if (newPassword !== confirmPassword) {
        return mostrarNotificacion('Las contraseñas no coinciden', 'error');
      }
    }

    if (Object.values(formErrors).some(v => v)) {
      return mostrarNotificacion('Por favor, corrige los errores en el formulario.', 'error');
    }

    try {
      setIsSaving(true);
      let finalAvatarUrl = user.avatar_url;

      // Si hay imagen pendiente, la subimos primero
      if (pendingImageFile) {
        setIsUploading(true);
        finalAvatarUrl = await userRepo.uploadAvatar(user.id, pendingImageFile);
      }

      // Actualizar datos de perfil (incluyendo el nuevo avatar si se subió)
      const dataToUpdate = { ...editData, avatar_url: finalAvatarUrl };
      await userRepo.update(user.id, dataToUpdate);

      // Actualizar contraseña
      if (newPassword) {
        await authRepo.updatePassword(newPassword);
      }

      setUser({ ...user, ...dataToUpdate } as Perfil);
      setMode('view');
      setNewPassword('');
      setConfirmPassword('');
      setPendingImageFile(null);
      setPreviewUrl(null);
      mostrarNotificacion('Perfil actualizado correctamente', 'success');
      onUpdate();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      mostrarNotificacion('Error al guardar cambios: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de 2 megas
    const limit = 2 * 1024 * 1024;
    if (file.size > limit) {
      return mostrarNotificacion('Imagen demasiado pesada. Máximo 2MB.', 'warning');
    }

    // Guardar el archivo localmente para subirlo al darle a "Guardar"
    setPendingImageFile(file);
    // Generar una URL local para la vista previa instantánea sin subir nada aún
    setPreviewUrl(URL.createObjectURL(file));
  };

  const toggleStatus = async () => {
    const newStatus = user.active === false;
    if (window.confirm(`¿Seguro que quieres ${newStatus ? 'activar' : 'desactivar'} a este usuario?`)) {
      try {
        await userRepo.toggleStatus(user.id, newStatus);
        setUser({ ...user, active: newStatus });
        mostrarNotificacion(`Usuario ${newStatus ? 'activado' : 'desactivado'}`, 'success');
        onUpdate();
      } catch (error: any) {
        mostrarNotificacion('Error al cambiar estado', 'error');
      }
    }
  };

  const getRoleName = (roleId: number | undefined) => {
    if (!roles) return 'Sin asignar';
    const role = roles.find(r => r.id === roleId);
    return role ? role.nombre : 'Sin asignar';
  };

  const fullName = `${user.nombre || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim();

  return (
    <div className={`max-w-6xl mx-auto pb-12 ${!hideBack ? 'pt-4' : 'pt-2'}`}>
      {/* Header / Navegación */}
      <div className={`flex items-center mb-8 ${hideBack ? 'justify-end' : 'justify-between'}`}>
        {!hideBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Volver al listado
          </button>
        )}

        <div className="flex gap-3">
          {mode === 'view' ? (
            <>
              {!hideBack && (
                <Button
                  variant="outline"
                  onClick={toggleStatus}
                  className={user.active === false ? "text-emerald-600 border-emerald-100 hover:bg-emerald-50" : "text-orange-600 border-orange-100 hover:bg-orange-50"}
                >
                  {user.active === false ? <CheckCircle2 size={18} className="mr-2" /> : <XCircle size={18} className="mr-2" />}
                  {user.active === false ? 'Activar Usuario' : 'Desactivar Usuario'}
                </Button>
              )}
              <Button onClick={handleEdit} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-6">
                <Edit2 size={18} className="mr-2" /> {hideBack ? 'Editar mi Perfil' : 'Editar Perfil'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X size={18} className="mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6">
                {isSaving ? 'Guardando...' : <><Save size={18} className="mr-2" /> Guardar Cambios</>}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Tarjeta de Perfil */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  {(previewUrl || user.avatar_url) ? (
                    <img
                      src={previewUrl || user.avatar_url || ''}
                      alt="Avatar"
                      className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-2xl">
                      {user.nombre?.charAt(0)}
                    </div>
                  )}
                  {mode === 'edit' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="pt-20 pb-8 px-6 text-center">
              <h1 className="text-2xl font-bold text-slate-800">{fullName || user.nombre_usuario}</h1>
              <p className="text-slate-600 font-medium">@{user.nombre_usuario}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 uppercase">
                  {getRoleName(user.role_id)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${user.active !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                  {user.active !== false ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </Card>

          {/* Infomación de contacto */}
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 uppercase tracking-wider font-bold">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Email</p>
                  <p className="text-sm font-semibold">{user.email || 'No disponible'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Teléfono</p>
                  <p className="text-sm font-semibold">{user.telefono || 'No disponible'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Detalles y Estadísticas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <CardContent className="p-6">
                  <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                  <p className="text-sm text-slate-600 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información principal */}
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b border-slate-50">
              <CardTitle>{mode === 'edit' ? (hideBack ? 'Editar mis datos' : 'Editar Información') : (hideBack ? 'Información de mi Cuenta' : 'Detalles del Perfil')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {mode === 'edit' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Nombre"
                      name="nombre"
                      value={editData.nombre || ''}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      required
                    />
                    <Input
                      label="Nombre de Usuario"
                      name="nombre_usuario"
                      value={editData.nombre_usuario || ''}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Primer Apellido"
                      name="primer_apellido"
                      value={editData.primer_apellido || ''}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      required
                    />
                    <Input
                      label="Segundo Apellido"
                      name="segundo_apellido"
                      value={editData.segundo_apellido || ''}
                      manejarCambio={manejarCambio}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={editData.telefono || ''}
                      manejarCambio={manejarCambio}
                      manejarError={manejarError}
                      regex={/^((\+34)\d{9}|\d{9})$/}
                      error="9 dígitos o +34..."
                      required
                    />
                    <Select
                      label="Rol del Sistema"
                      name="role_id"
                      value={editData.role_id || ''}
                      manejarCambio={manejarCambio}
                      disabled={hideBack}
                      options={roles.map(rol => ({ value: rol.id, label: rol.nombre }))}
                    />
                  </div>

                  {/* Sección de cambio de contraseña */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Key size={16} className="text-blue-500" /> Cambiar Contraseña
                    </h4>
                    <p className="text-xs text-slate-500 italic">Si dejas estos campos en blanco, la contraseña se mantendrá igual.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input
                        label="Nueva Contraseña"
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        manejarCambio={manejarCambioPass}
                        manejarError={manejarError}
                        placeholder="********"
                        regex={newPassword ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ : undefined}
                        error="Mínimo 8 carac, 1 mayús, 1 num..."
                      />
                      <Input
                        label="Confirmar Contraseña"
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        manejarCambio={manejarCambioPass}
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                  <DetailItem label="Nombre Completo" value={fullName} />
                  <DetailItem label="Nombre de Usuario" value={`@${user.nombre_usuario}`} />
                  <DetailItem label="Correo Electrónico" value={user.email} />
                  <DetailItem label="Teléfono" value={user.telefono} />
                  <DetailItem label="Rol" value={getRoleName(user.role_id)} />
                  <DetailItem
                    label="Estado de la Cuenta"
                    value={
                      <span className={`inline-flex items-center gap-1.5 font-bold ${user.active !== false ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {user.active !== false ? 'Activa y Operativa' : 'Desactivada / Bloqueada'}
                      </span>
                    }
                  />
                  <DetailItem label="Fecha de Registro" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de Peligro. Todavía no se ha implementado */}
          {/* {mode === 'view' && showDangerZone && (
            <Card className="border border-red-100 bg-red-50/30 overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-800">Zona de Peligro</h4>
                  <p className="text-xs text-red-600 mt-1">Eliminar permanentemente este usuario y todos sus datos asociados.</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash size={16} className="mr-2" /> Eliminar Usuario
                </Button>
              </CardContent>
            </Card>
          )} */}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{label}</p>
    <div className="text-slate-700 font-medium text-[15px]">{value || '-'}</div>
  </div>
);
