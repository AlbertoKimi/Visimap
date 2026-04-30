import React from 'react';
import { UserX, Eye, Edit, Trash2 } from 'lucide-react';
import { Perfil } from '@/interfaces/Perfil';
import { TablaGenerica, ColumnDef, ColumnFilter } from '@/components/ui/TablaGenerica';
import { Menu, MenuItem } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import { UsersTableProps } from '@/interfaces/components';



const ActionsCell: React.FC<{
  profile: Perfil;
  onAction: (action: string, profile: Perfil) => void;
}> = ({ profile, onAction }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleActionClick = (action: string) => {
    handleClose();
    onAction(action, profile);
  };

  return (
    <div className="flex justify-end">
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
        onClick={e => e.stopPropagation()}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            mt: 1,
            minWidth: 160,
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              gap: 1.5,
              color: 'var(--menu-text)',
              borderRadius: '6px',
              mx: 0.5,
              my: 0.2,
              '&:hover': { backgroundColor: 'var(--menu-hover)' },
            },
          },
        }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'var(--menu-bg)',
            color: 'var(--menu-text)',
            borderColor: 'var(--menu-border)',
            borderWidth: '1px',
            borderStyle: 'solid',
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
          {profile.active !== false ? (
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
    </div>
  );
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  roles,
  onAction,
  onDeactivateSelected,
}) => {
  // Columnas
  const columns: ColumnDef<Perfil>[] = [
    {
      key: 'nombre',
      header: 'Usuario',
      sortable: true,
      render: (profile) => {
        const fullName = `${profile.nombre || ''} ${profile.primer_apellido || ''} ${profile.segundo_apellido || ''}`.trim();
        const displayName = fullName || profile.nombre_usuario || 'Sin nombre';
        const initial = displayName.charAt(0).toUpperCase();
        return (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onAction('view', profile)}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border border-white dark:border-slate-700 shadow-sm flex-shrink-0">
                {initial}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{displayName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">@{profile.nombre_usuario}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (profile) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{profile.email || '—'}</span>
      ),
    },
    {
      key: 'role_id',
      header: 'Rol',
      sortable: true,
      render: (profile) => {
        const role = roles.find(r => r.id === profile.role_id);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border dark:border-slate-700">
            {role ? role.nombre : 'Sin rol'}
          </span>
        );
      },
    },
    {
      key: 'active',
      header: 'Estado',
      sortable: true,
      render: (profile) =>
        profile.active !== false ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        ),
    },
    {
      key: '_actions',
      header: 'Acciones',
      render: (profile) => (
        <ActionsCell profile={profile} onAction={onAction} />
      ),
    },
  ];

  // Filtros desplegables
  const columnFilters: ColumnFilter<Perfil>[] = [
    {
      key: 'active',
      label: 'Estado',
      options: [
        { label: 'Activo', value: 'true' },
        { label: 'Inactivo', value: 'false' },
      ],
      filterFn: (row: Perfil, value: string) =>
        String(row.active !== false) === value,
    },
    {
      key: 'role_id',
      label: 'Rol',
      options: roles.map(r => ({ label: r.nombre, value: String(r.id) })),
      filterFn: (row: Perfil, value: string) => String(row.role_id) === value,
    },
  ];

  return (
    <TablaGenerica<Perfil>
      data={users}
      columns={columns}
      getRowId={profile => profile.id}
      columnFilters={columnFilters}
      searchPlaceholder="Buscar por nombre, email o usuario..."
      searchKeys={['nombre', 'primer_apellido', 'segundo_apellido', 'email', 'nombre_usuario']}
      onDeleteSelected={
        onDeactivateSelected
          ? (ids) => onDeactivateSelected(ids as string[])
          : undefined
      }
      deleteSelectedLabel="Marcar inactivos"
      pageSize={10}
      emptyMessage="No hay usuarios registrados"
      emptyDescription="Actualmente no hay perfiles en la base de datos."
      emptyIcon={<UserX size={28} />}
    />
  );
};
