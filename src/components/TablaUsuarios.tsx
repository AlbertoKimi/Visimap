import React from 'react';
import { UserX } from 'lucide-react';
import { UserRow } from './FilasUsuario';
import { Perfil } from '../interfaces/Perfil';
import { Rol } from '../interfaces/Rol';

interface UsersTableProps {
  users: Perfil[];
  roles: Rol[];
  onAction: (action: string, profile: Perfil) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, roles, onAction }) => {

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <UserX className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No hay usuarios registrados</h3>
        <p className="text-slate-500 max-w-sm mt-2 mb-6">
          Actualmente no hay perfiles en la base de datos.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50">
            <th className="p-6 font-semibold">Usuario</th>
            <th className="p-6 font-semibold">Email</th>
            <th className="p-6 font-semibold">Rol</th>
            <th className="p-6 font-semibold">Estado</th>
            <th className="p-6 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} profile={user} roles={roles} onAction={onAction} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
