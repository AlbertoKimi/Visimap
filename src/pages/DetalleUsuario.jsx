import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trash2, Edit2, Shield, User, Phone, Mail, Lock, Camera } from 'lucide-react';
import { Button } from '../components/button';
import { InputField } from '../components/InputField';
import { supabase } from '../utils/supabaseClient';

export const DetalleUsuario = ({ user, initialMode = 'view', roles = [], onBack, onUpdate, onDelete, mostrarNotificacion }) => {
    const [mode, setMode] = useState(initialMode); // 'view' or 'edit'
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        email: '',
        telefono: '',
        role_id: '',
        avatar_url: '',
        password: '',
        confirmPassword: '',
        active: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nombre_usuario: user.nombre_usuario || '',
                nombre: user.nombre || '',
                primer_apellido: user.primer_apellido || '',
                segundo_apellido: user.segundo_apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                role_id: user.role_id || '',
                avatar_url: user.avatar_url || '',
                password: '',
                confirmPassword: '',
                active: user.active !== false // Default to true if undefined
            });
        }
    }, [user]);

    const toggleMode = () => {
        if (mode === 'view') setMode('edit');
        else {
            // Create a reset by reloading user data
            setFormData({
                nombre_usuario: user.nombre_usuario || '',
                nombre: user.nombre || '',
                primer_apellido: user.primer_apellido || '',
                segundo_apellido: user.segundo_apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                role_id: user.role_id || '',
                avatar_url: user.avatar_url || '',
                password: '',
                confirmPassword: '',
                active: user.active !== false
            });
            setMode('view');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarClick = () => {
        if (mode === 'edit' && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        try {
            setUploadingAvatar(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Selecciona una imagen.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            mostrarNotificacion('Imagen subida correctamente', 'success');

        } catch (error) {
            console.error('Error uploading avatar:', error);
            mostrarNotificacion('Error al subir imagen: ' + error.message, 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);

        try {
            // Validation
            if (mode === 'edit') {
                if (formData.password && formData.password !== formData.confirmPassword) {
                    mostrarNotificacion('Las contraseñas no coinciden', 'error');
                    setIsLoading(false);
                    return;
                }
            }

            const updates = {
                nombre_usuario: formData.nombre_usuario,
                nombre: formData.nombre,
                primer_apellido: formData.primer_apellido,
                segundo_apellido: formData.segundo_apellido,
                telefono: formData.telefono,
                role_id: formData.role_id,
                avatar_url: formData.avatar_url,
                active: formData.active
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            if (formData.password) {
                mostrarNotificacion('Nota: La actualización de contraseña requiere permisos de administrador en el backend.', 'warning');
            }

            mostrarNotificacion('Usuario actualizado correctamente', 'success');
            if (onUpdate) onUpdate();
            setMode('view');

        } catch (err) {
            console.error('Error updating user:', err);
            mostrarNotificacion('Error al actualizar usuario: ' + err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = !formData.active;
        const actionName = newStatus ? 'activar' : 'desactivar';

        if (window.confirm(`¿Estás seguro de ${actionName} este usuario?`)) {
            try {
                setIsLoading(true);
                const { error } = await supabase
                    .from('profiles')
                    .update({ active: newStatus })
                    .eq('id', user.id);

                if (error) throw error;

                setFormData(prev => ({ ...prev, active: newStatus }));
                mostrarNotificacion(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
                if (onUpdate) onUpdate();

            } catch (err) {
                console.error('Error toggling status:', err);
                mostrarNotificacion('Error al cambiar estado: ' + err.message, 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getRoleName = (id) => roles.find(r => r.id === id)?.nombre || 'Desconocido';

    // Standard sizes for both modes
    const controlHeight = 'h-10';
    const fontSize = 'text-sm';
    const labelSize = 'text-xs';
    const inputPadding = 'px-3 py-2';

    return (
        <div className="w-full h-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 flex-1 flex flex-col max-h-full overflow-hidden transition-all duration-300">

                {/* Header */}
                <div className="flex-none p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100 h-9 w-9">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                        <div>
                            <h2 className="font-bold text-slate-800 leading-tight text-xl">
                                {mode === 'view' ? 'Detalles del Usuario' : 'Modificar Usuario'}
                            </h2>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${formData.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {formData.active ? 'Activo' : 'Inactivo'}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                    <form id="user-form" onSubmit={handleSubmit} className="h-full">
                        <div className="flex flex-col md:flex-row gap-8 h-full">

                            {/* Sidebar / Avatar Column - Standard width */}
                            <div className="flex-none w-full md:w-56 flex flex-col items-center pt-4 gap-4">
                                <div
                                    className={`relative group ${mode === 'edit' ? 'cursor-pointer' : ''}`}
                                    onClick={handleAvatarClick}
                                    title={mode === 'edit' ? "Click para cambiar imagen" : ""}
                                >
                                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 relative ${uploadingAvatar ? 'opacity-50' : ''}`}>
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    {mode === 'edit' && (
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center text-white">
                                                <Camera className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] font-medium">Cambiar</span>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>

                                <div className="text-center w-full px-2">
                                    <h3 className="font-bold text-slate-800 truncate text-lg">
                                        {formData.nombre} {formData.primer_apellido}
                                    </h3>
                                    <p className="text-blue-600 font-medium truncate text-sm mt-1">@{formData.nombre_usuario || user.nombre_usuario}</p>
                                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                        {getRoleName(formData.role_id)}
                                    </div>
                                </div>
                            </div>

                            {/* Form Column - 12 Column Grid */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">

                                    {/* Row 1: Username (8) | Role (4) */}
                                    <div className="col-span-1 md:col-span-8 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Nombre de Usuario</label>
                                        {mode === 'view' ? (
                                            <div className={`flex items-center ${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 ${controlHeight}`}>
                                                {/* <User className="w-4 h-4 mr-2 text-slate-400" /> */}
                                                @{formData.nombre_usuario || '-'}
                                            </div>
                                        ) : (
                                            <InputField
                                                value={formData.nombre_usuario}
                                                onChange={(e) => handleChange('nombre_usuario', e.target.value)}
                                                placeholder="Nombre de usuario"
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                                icon={<User className="w-4 h-4 text-slate-400" />}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Rol</label>
                                        {mode === 'view' ? (
                                            <div className={`flex items-center ${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 ${controlHeight}`}>
                                                {/* <Shield className="w-4 h-4 mr-2 text-slate-400" /> */}
                                                {getRoleName(formData.role_id)}
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.role_id}
                                                onChange={(e) => handleChange('role_id', e.target.value)}
                                                className={`w-full ${inputPadding} border border-gray-300 rounded-lg ${fontSize} outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white ${controlHeight}`}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.nombre}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>


                                    {/* Row 2: Name (4) | Surname1 (4) | Surname2 (4) */}
                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Nombre</label>
                                        {mode === 'view' ? (
                                            <div className={`${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 truncate ${controlHeight}`}>{formData.nombre}</div>
                                        ) : (
                                            <InputField
                                                value={formData.nombre}
                                                onChange={(e) => handleChange('nombre', e.target.value)}
                                                placeholder="Nombre"
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Primer Apellido</label>
                                        {mode === 'view' ? (
                                            <div className={`${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 truncate ${controlHeight}`}>{formData.primer_apellido}</div>
                                        ) : (
                                            <InputField
                                                value={formData.primer_apellido}
                                                onChange={(e) => handleChange('primer_apellido', e.target.value)}
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Segundo Apellido</label>
                                        {mode === 'view' ? (
                                            <div className={`${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 truncate ${controlHeight}`}>{formData.segundo_apellido || '-'}</div>
                                        ) : (
                                            <InputField
                                                value={formData.segundo_apellido}
                                                onChange={(e) => handleChange('segundo_apellido', e.target.value)}
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                            />
                                        )}
                                    </div>


                                    {/* Row 3: Email (8) | Phone (4) */}
                                    <div className="col-span-1 md:col-span-8 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Email</label>
                                        {mode === 'view' ? (
                                            <div className={`flex items-center ${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 truncate ${controlHeight}`}>
                                                {/* <Mail className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" /> */}
                                                <span className="truncate">{formData.email}</span>
                                            </div>
                                        ) : (
                                            <InputField
                                                value={formData.email}
                                                disabled={true}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                            // icon={<Mail className="w-4 h-4 text-slate-400" />}
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-1 md:col-span-4 space-y-1.5">
                                        <label className={`${labelSize} font-bold text-slate-500 uppercase tracking-wider`}>Teléfono</label>
                                        {mode === 'view' ? (
                                            <div className={`flex items-center ${inputPadding} bg-slate-50 rounded-lg ${fontSize} text-slate-700 font-medium border border-slate-100 ${controlHeight}`}>
                                                {/* <Phone className="w-4 h-4 mr-2 text-slate-400" /> */}
                                                {formData.telefono || '-'}
                                            </div>
                                        ) : (
                                            <InputField
                                                value={formData.telefono}
                                                onChange={(e) => handleChange('telefono', e.target.value)}
                                                className={`${fontSize} ${inputPadding} ${controlHeight}`}
                                                icon={<Phone className="w-4 h-4 text-slate-400" />}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Password Section */}
                                {mode === 'edit' && (
                                    <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in">
                                        <div className="flex items-center mb-3">
                                            {/* <Lock className="w-4 h-4 mr-2 text-blue-600" /> */}
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cambiar Contraseña</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <InputField
                                                    type="password"
                                                    placeholder="Nueva contraseña"
                                                    className={`text-sm ${inputPadding} ${controlHeight}`}
                                                    value={formData.password}
                                                    onChange={(e) => handleChange('password', e.target.value)}
                                                />
                                            </div>
                                            {formData.password && (
                                                <div className="space-y-1.5 animate-in slide-in-from-left-2 fade-in">
                                                    <InputField
                                                        type="password"
                                                        placeholder="Confirmar contraseña"
                                                        className={`text-sm ${inputPadding} ${controlHeight}`}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="flex-none border-t border-slate-100 bg-slate-50/50 rounded-b-2xl p-4">
                    {mode === 'edit' ? (
                        <div className="flex justify-center gap-4 w-full">
                            <Button type="button" variant="ghost" onClick={toggleMode} className="w-48 h-10 text-sm font-medium">
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || uploadingAvatar}
                                className="w-48 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-10 text-sm font-medium shadow-md transition-shadow hover:shadow-lg"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-4 w-full">
                            <Button type="button" variant="outline" onClick={onBack} className="w-48 h-10 text-sm border-slate-300 font-medium">
                                Volver
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setMode('edit')} className="w-48 h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 font-medium">
                                Modificar
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleToggleStatus}
                                className={`w-48 h-10 text-sm font-medium border-2 ${formData.active
                                    ? 'border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300'
                                    : 'border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300'
                                    }`}
                            >
                                {formData.active ? 'Desactivar' : 'Activar'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
