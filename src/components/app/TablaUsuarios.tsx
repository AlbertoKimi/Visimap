import React from 'react';
import { UserX, Eye, Edit, Trash2, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Perfil } from '@/interfaces/Perfil';
import { TablaGenerica } from '@/components/ui/TablaGenerica';
import { ColumnDef, ColumnFilter } from '@/interfaces/ui';
import { Menu, MenuItem } from '@mui/material';
import { UsersTableProps } from '@/interfaces/components';



/**
 * Celda de acciones para la tabla de usuarios.
 * Renderiza un menú desplegable (MUI Menu) con opciones para ver detalles,
 * editar el perfil o cambiar el estado de activación del usuario.
 * @param props.profile - El perfil de usuario asociado a la fila.
 * @param props.onAction - Callback para manejar la acción seleccionada.
 * @param props.currentUserId - ID del usuario actualmente autenticado (para evitar auto-acciones).
 */
const ActionsCell: React.FC<{
  profile: Perfil;
  onAction: (action: string, profile: Perfil) => void;
  currentUserId?: string;
}> = ({ profile, onAction, currentUserId }) => {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (profile.id === currentUserId) return null;

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
        type="button"
        onClick={handleClick}
        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        data-state={open ? 'open' : 'closed'}
      >
        <MoreVertical className="size-5" />
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
              <CheckCircle2 size={16} className="text-green-500" /> Activar
            </>
          )}
        </MenuItem>
      </Menu>
    </div>
  );
};

/**
 * Tabla principal para la gestión del personal/equipo.
 * Utiliza el componente genérico `TablaGenerica` para mostrar la lista de perfiles,
 * permitiendo búsqueda, filtrado por rol/estado y acciones masivas de activación/desactivación.
 * @param props - Propiedades que incluyen la lista de usuarios, roles disponibles y manejadores de eventos.
 * @returns Componente de tabla interactiva.
 */
export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  roles,
  onAction,
  onDeactivateSelected,
  onActivateSelected,
  currentUserId,
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
        // No envolvemos en <button>: el click se gestiona a nivel de fila
        // (onRowClick más abajo). Así toda la fila es clicable salvo el
        // menú de 3 puntos, que hace stopPropagation.
        return (
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="size-9 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="size-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border border-white dark:border-slate-700 shadow-sm flex-shrink-0">
                {initial}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{profile.nombre_usuario}</p>
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
        const roleName = role?.nombre?.toLowerCase() || '';

        // Colores semánticos por rol, coherentes con el resto de badges
        // de la app (Activo=verde, Inactivo=rojo, Individual=ámbar, Grupo=índigo).
        // Admin → violeta (autoridad), Trabajador → teal (operativo).
        // En dark mode usamos fondos SÓLIDOS (sin opacidad /30) para que
        // los badges no se mezclen con el azul de la fila seleccionada.
        let roleClasses: string;
        if (roleName === 'admin') {
          roleClasses =
            'bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-100 border-violet-300 dark:border-violet-500';
        } else if (roleName === 'trabajador') {
          roleClasses =
            'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-100 border-teal-300 dark:border-teal-500';
        } else {
          roleClasses =
            'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600';
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleClasses}`}
          >
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
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/40">
            <span className="size-1.5 rounded-full bg-red-500 dark:bg-red-400" />
            Inactivo
          </span>
        ),
    },
    {
      key: '_actions',
      header: 'Acciones',
      render: (profile) => (
        <ActionsCell profile={profile} onAction={onAction} currentUserId={currentUserId} />
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
      // Toda la fila abre el perfil del usuario (acción "view"). El menú
      // de 3 puntos (ActionsCell) hace stopPropagation, por lo que clicarlo
      // NO dispara este onRowClick. Para la propia cuenta del admin la
      // acción se descarta en `handleAction` de VistaUsuarios.
      onRowClick={(profile) => onAction('view', profile)}
      searchPlaceholder="Buscar por nombre, email o usuario..."
      searchKeys={['nombre', 'primer_apellido', 'segundo_apellido', 'email', 'nombre_usuario']}
      onDeleteSelected={
        onDeactivateSelected
          ? (ids) => onDeactivateSelected(ids as string[])
          : undefined
      }
      onActivateSelected={
        onActivateSelected
          ? (ids) => onActivateSelected(ids as string[])
          : undefined
      }
      activateSelectedLabel="Marcar activos"
      getRowActiveState={(profile) => profile.active !== false}
      isRowSelectable={(profile) => profile.id !== currentUserId}
      deleteSelectedLabel="Marcar inactivos"
      pageSize={10}
      emptyMessage="No hay usuarios registrados"
      emptyDescription="Actualmente no hay perfiles en la base de datos."
      emptyIcon={<UserX size={28} />}
    />
  );
};
