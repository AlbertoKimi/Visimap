import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";

interface UserRowProps {
  profile: Perfil;
  roles: Rol[];
  onAction: (action: string, profile: Perfil) => void;
}

export const UserRow: React.FC<UserRowProps> = ({ profile, roles, onAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Evitar que el clic en el botón active el clic de la fila
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: string) => {
    handleClose();
    if (onAction) onAction(action, profile);
  };

  const getRoleName = (roleId: number | undefined) => {
    if (!roles || !roles.length) return 'Cargando...';
    if (roleId === undefined) return 'Sin rol';

    const role = roles.find(r => r.id === roleId);
    return role ? role.nombre : 'Rol desconocido';
  };

  const fullName = `${profile.nombre || ''} ${profile.primer_apellido || ''} ${profile.segundo_apellido || ''}`.trim();
  const displayName = fullName || profile.nombre_usuario || 'Usuario sin nombre';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <tr 
      onClick={() => onAction('view', profile)}
      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer"
    >
      <td className="p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold border border-white shadow-sm">
              {initial}
            </div>
          )}

          <div>
            <p className="font-semibold text-slate-800">{displayName}</p>
            <p className="text-xs text-slate-400">@{profile.nombre_usuario}</p>
          </div>
        </div>
      </td>

      <td className="p-6">
        <p className="text-sm text-slate-600">{profile.email || '-'}</p>
      </td>

      <td className="p-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {getRoleName(profile.role_id)}
        </span>
      </td>
      <td className="p-6">
        {(profile.active !== false) ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Inactivo
          </span>
        )}
      </td>

      <td className="p-6 text-right">
        <button
          onClick={handleClick}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
          data-state={open ? 'open' : 'closed'}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '12px',
              mt: 1,
              minWidth: 160,
              '& .MuiMenuItem-root': {
                fontSize: '0.9rem',
                gap: 1.5,
                color: '#334155',
                borderRadius: '6px',
                mx: 0.5,
                my: 0.2,
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                }
              }
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleActionClick('view')}>
            <Eye size={16} className="text-slate-400" /> Ver
          </MenuItem>
          <MenuItem onClick={() => handleActionClick('edit')}>
            <Edit size={16} className="text-blue-500" /> Modificar
          </MenuItem>
          <MenuItem onClick={() => handleActionClick('toggle_status')}>
            {(profile.active !== false) ? (
              <>
                <Trash2 size={16} className="text-orange-500" /> Desactivar
              </>
            ) : (
              <>
                <Edit size={16} className="text-green-500" /> Activar
              </>
            )}
          </MenuItem>
        </Menu>
      </td>
    </tr>
  );
};
