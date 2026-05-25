import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/Select";
import { ModalConfirmacion } from "@/components/app/modales/ModalConfirmacion";
import { RepositoryFactory } from "@/database/RepositoryFactory";
import { FormularioRegistroProps } from "@/interfaces/components";

const authRepo = RepositoryFactory.getAuthRepository();

/**
 * Formulario para invitar a nuevos miembros del equipo (Administradores/Trabajadores).
 * Gestiona la captura y validación de datos personales y contacta con el backend
 * de Supabase para enviar un enlace mágico (Magic Link) de primer inicio de sesión.
 * @param props.onCancel - Callback para cerrar el modal sin hacer cambios
 * @param props.onSuccess - Callback para refrescar la tabla al invitar exitosamente
 * @param props.mostrarNotificacion - Función externa para emitir toasts
 */
export const FormularioRegistroUsuario: React.FC<FormularioRegistroProps> = ({
  onCancel,
  onSuccess,
  mostrarNotificacion
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmarInvitacion, setConfirmarInvitacion] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    rol: 'trabajador'
  });
  const formErrors = useRef<Record<string, boolean>>({});

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const manejarError = (name: string, hasError: boolean) => {
    formErrors.current[name] = hasError;
  };

  // Solo valida y abre el modal de confirmación. El envío real está en `enviarInvitacion`.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(formErrors.current).some(v => v)) {
      mostrarNotificacion('Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    // Verificamos que ningún campo obligatorio esté vacío antes de abrir el modal
    if (!formData.nombre || !formData.apellidos || !formData.telefono || !formData.email) {
      mostrarNotificacion('Por favor, completa todos los campos antes de continuar.', 'error');
      return;
    }

    setConfirmarInvitacion(true);
  };

  const enviarInvitacion = async () => {
    setIsLoading(true);

    try {
      const apellidosStr = formData.apellidos.trim();
      const primerEspacio = apellidosStr.indexOf(' ');
      let apellido1 = apellidosStr;
      let apellido2 = '';

      if (primerEspacio !== -1) {
        apellido1 = apellidosStr.substring(0, primerEspacio);
        apellido2 = apellidosStr.substring(primerEspacio + 1).trim();
      }

      await authRepo.inviteUser(formData.email, {
        nombre: formData.nombre,
        apellido1: apellido1,
        apellido2: apellido2,
        telefono: formData.telefono,
        rol: formData.rol,
        role_id: formData.rol === 'admin' ? 1 : 2
      });

      mostrarNotificacion('Usuario invitado correctamente. Se ha enviado un correo de confirmación.', 'success');
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error("Error al invitar:", err);

      const rawMsg = String(err?.message || '').toLowerCase();
      let mensajeAmigable = 'No se ha podido invitar al usuario. Inténtalo de nuevo en unos momentos.';

      if (
        err?.message === 'USER_ALREADY_EXISTS' ||
        rawMsg.includes('already') ||
        rawMsg.includes('exists') ||
        rawMsg.includes('registered') ||
        rawMsg.includes('duplicate') ||
        rawMsg.includes('ya está') ||
        rawMsg.includes('ya existe')
      ) {
        mensajeAmigable = `El correo "${formData.email}" ya está registrado en el sistema. Si el usuario no recuerda su contraseña, contacta con un administrador para reenviarle la invitación.`;
      } else if (rawMsg.includes('email') && (rawMsg.includes('invalid') || rawMsg.includes('no válido'))) {
        mensajeAmigable = 'El correo electrónico introducido no es válido.';
      } else if (rawMsg.includes('rate') || rawMsg.includes('too many')) {
        mensajeAmigable = 'Se han enviado demasiadas invitaciones en poco tiempo. Espera unos minutos e inténtalo de nuevo.';
      } else if (rawMsg.includes('network') || rawMsg.includes('fetch')) {
        mensajeAmigable = 'No se ha podido conectar con el servidor. Comprueba tu conexión a internet.';
      }

      mostrarNotificacion(mensajeAmigable, 'error');
      // Cerramos el formulario para que el toast sea visible y no quede tapado por el modal.
      if (onCancel) onCancel();
    } finally {
      setIsLoading(false);
      setConfirmarInvitacion(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="p-1">
        <div className="grid grid-cols-1 gap-5">
          <Input
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
            regex={/^(?=.{1,25}$)[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?: [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)?$/}
            error="Nombre inválido (máx. 25 caracteres, solo letras, puede ser nombre compuesto)."
            maxLength={25}
            placeholder="Introduce el nombre"
          />

          <Input
            name="apellidos"
            label="Apellidos"
            value={formData.apellidos}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
            regex={/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+ [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/}
            error="Debes introducir exactamente dos apellidos separados por un espacio (solo letras)."
            placeholder="Primer y segundo apellido"
          />

          <Input
            name="telefono"
            label="Teléfono"
            type="tel"
            value={formData.telefono}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
            regex={/^((\+34)\d{9}|\d{9})$/}
            error="Formato incorrecto (9 dígitos o +34...)"
            placeholder="Ej: 600123456"
          />

          <Input
            name="email"
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
            regex={/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/}
            error="Email no válido"
            placeholder="usuario@dominio.com"
          />

          <Select
            name="rol"
            label="Rol del Usuario"
            value={formData.rol}
            manejarCambio={manejarCambio}
            options={[
              { value: 'trabajador', label: 'Trabajador' },
              { value: 'admin', label: 'Administrador' }
            ]}
            required
          />
        </div>

        <div className="flex gap-2 pt-8">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              className="flex-1 h-12 text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:opacity-90 rounded-xl transition-all"
          >
            {isLoading ? 'Invitando...' : 'Invitar Usuario'}
          </Button>
        </div>
      </form>

      <ModalConfirmacion
        isOpen={confirmarInvitacion}
        onClose={() => setConfirmarInvitacion(false)}
        onConfirm={enviarInvitacion}
        titulo="¿Enviar invitación?"
        mensaje={
          `Se enviará un correo de invitación a "${formData.email}" con permisos de ${formData.rol === 'admin' ? 'Administrador' : 'Trabajador'}. ` +
          `Esta persona podrá iniciar sesión en Visimap inmediatamente después de aceptar.`
        }
        tipo="success"
      />
    </div>
  );
};
