import React, { useState } from 'react';
import { Button } from './button';
import Input from './inputs/Input';
import Select from './inputs/Select';
import { RepositoryFactory } from '../database/RepositoryFactory';

const authRepo = RepositoryFactory.getAuthRepository();

interface FormularioRegistroProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

export const FormularioRegistroUsuario: React.FC<FormularioRegistroProps> = ({ 
  onCancel, 
  onSuccess, 
  mostrarNotificacion 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    rol: 'trabajador'
  });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const manejarError = (name: string, hasError: boolean) => {
    setFormErrors(prev => ({ ...prev, [name]: hasError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.values(formErrors).some(v => v)) {
        mostrarNotificacion('Por favor, corrige los errores en el formulario.', 'error');
        return;
    }

    setIsLoading(true);

    try {
      // Procesar apellidos
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
        role_id: formData.rol === 'admin' ? 1 : 2
      });

      mostrarNotificacion('Usuario invitado correctamente. Se ha enviado un correo de confirmación.', 'success');
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error("Error al invitar:", err);
      mostrarNotificacion(err.message || 'Error al invitar al usuario.', 'error');
    } finally {
      setIsLoading(false);
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
            placeholder="Introduce el nombre"
          />

          <Input
            name="apellidos"
            label="Apellidos"
            value={formData.apellidos}
            manejarCambio={manejarCambio}
            manejarError={manejarError}
            required
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
            className="flex-1 h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:opacity-90 rounded-xl transition-all"
          >
            {isLoading ? 'Invitando...' : 'Invitar Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};
