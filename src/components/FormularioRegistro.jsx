import { useState } from 'react';
import { Button } from './button';
import { InputField } from './InputField';
import { supabase } from '../utils/supabaseClient';

export function FormularioRegistroUsuario({ onCancel, onSuccess, mostrarNotificacion }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        rol: 'trabajador'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {

            // Regex telefono

            const telefonoRegex = /^((\+34)\d{9}|\d{9})$/;
            if (!telefonoRegex.test(formData.telefono.trim())) {
                mostrarNotificacion('El teléfono debe tener 9 dígitos numéricos o empezar por +34 seguido de 9 dígitos.', 'error');
                setIsLoading(false);
                return;
            }

            // Separar apellidos
            const apellidosStr = formData.apellidos.trim();
            const primerEspacio = apellidosStr.indexOf(' ');

            let apellido1 = apellidosStr;
            let apellido2 = '';

            if (primerEspacio !== -1) {
                apellido1 = apellidosStr.substring(0, primerEspacio);
                apellido2 = apellidosStr.substring(primerEspacio + 1).trim();
            }

            // Validaciones de correo existente y nombre y apellidos

            const { data: existingEmail, error: emailCheckError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', formData.email)
                .maybeSingle();

            if (emailCheckError) console.error("Error comprobando email:", emailCheckError);

            if (existingEmail) {
                mostrarNotificacion('Este correo electrónico ya está registrado en el sistema.', 'error');
                setIsLoading(false);
                return;
            }

            const { data: potentialDuplicates, error: nameCheckError } = await supabase
                .from('profiles')
                .select('id, primer_apellido, segundo_apellido')
                .eq('nombre', formData.nombre)
                .ilike('primer_apellido', apellido1);

            if (nameCheckError) console.error("Error comprobando nombre:", nameCheckError);

            let existingUser = false;
            if (potentialDuplicates && potentialDuplicates.length > 0) {
                existingUser = potentialDuplicates.some(user => {
                    const dbApellido2 = (user.segundo_apellido || '').toLowerCase().trim();
                    const inputApellido2 = (apellido2 || '').toLowerCase().trim();
                    return dbApellido2 === inputApellido2;
                });
            }

            if (existingUser) {
                mostrarNotificacion('Ya existe un usuario con este nombre y apellidos en el sistema.', 'error');
                setIsLoading(false);
                return;
            }

            // 1. Invitación al trabajador

            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: formData.email,
                    options: {
                        data: {
                            nombre: formData.nombre,
                            apellido1: apellido1,
                            apellido2: apellido2,
                            telefono: formData.telefono,
                            role_id: formData.rol === 'admin' ? 1 : 2
                        }
                    }
                }
            });

            if (error) throw error;

            console.log("Usuario invitado:", data);

            mostrarNotificacion('Usuario invitado correctamente. Se ha enviado un correo de confirmación.', 'success');

            if (onSuccess) onSuccess();

        } catch (err) {
            console.error("FULL ERROR OBJECT:", err);
            let mensajeError = err.message || 'Error al invitar al usuario.';

            // Errores y debug de errores:

            if (typeof err === 'object' && err !== null) {
                if (err.context && err.context.json) {
                    try {
                        const jsonError = await err.context.json();
                        console.error("Edge Function Body:", jsonError);
                        if (jsonError.error) mensajeError = jsonError.error;
                        else if (jsonError.message) mensajeError = jsonError.message;
                    } catch (e) { /* ignore */ }
                }
                if (err.error) mensajeError = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
            }

            if (mensajeError === 'Edge Function returned a non-2xx status code') {
                mensajeError = 'Error del servidor (500/400). Revisa la consola del navegador para ver el detalle.';
            }
            else if (mensajeError.toLowerCase().includes('rate limit') || mensajeError.includes('429')) {
                mensajeError = 'Has excedido el límite de envíos de correo. Por favor, espera unos minutos antes de intentar de nuevo.';
            }
            else if (mensajeError.toLowerCase().includes('user already registered') ||
                mensajeError.toLowerCase().includes('already exists') ||
                mensajeError.includes('23505')) {
                mensajeError = 'Este correo electrónico ya está registrado en el sistema.';
            }

            mostrarNotificacion(mensajeError, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <InputField
                        id="nombre"
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />

                    <InputField
                        id="apellidos"
                        label="Apellidos"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        required
                    />

                    <InputField
                        id="telefono"
                        label="Telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                    />

                    <InputField
                        id="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <div className="col-span-1 flex flex-col">
                        <label htmlFor="rol" className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                            Rol
                        </label>
                        <select
                            id="rol"
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all bg-white"
                        >
                            <option value="trabajador">Trabajador</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 pt-2 mt-auto">
                    {onCancel && (
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 h-10 text-sm"
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-10 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all"
                    >
                        {isLoading ? 'Invitando...' : 'Invitar Usuario'}
                    </Button>
                </div>
            </form>
        </div>
    );
}