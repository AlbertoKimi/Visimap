/**
 * Módulo de declaración de interfaces para las propiedades (Props)
 * de los componentes principales de la aplicación.
 * @module
 */

import { Session } from '@supabase/supabase-js';
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";
import { RegistroMapa } from "@/interfaces/Visitor";
import { RegistroEvento, TipoEvento } from "@/interfaces/Evento";

/** Props para el componente LandingPage */
export interface LandingPageProps {
  onGetStarted: () => void;
}

/** Props para el flujo de recuperación/creación de contraseña */
export interface EstablecerContrasenaProps {
  session: Session | null;
  onComplete?: () => void;
}

/** Props para la vista de detalle y edición de un usuario */
export interface DetalleUsuarioProps {
  user: Perfil;
  initialMode?: string;
  roles: Rol[];
  onBack: () => void;
  onUpdate: () => void;
  mostrarNotificacion: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
  hideBack?: boolean;
}

/** Props para la barra de navegación lateral (Sidebar) */
export interface MenuLateralProps {
  userProfile: Perfil | null;
  logoUrl?: string;
}

/** Props base para las tarjetas que contienen gráficos Recharts */
export interface TarjetaGraficoProps {
  titulo: string;
  subtitulo?: string;
  icono?: React.ReactNode;
  colorIcono?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  altura?: string;
}

/** Props para estados vacíos con botón de sugerencia de IA */
export interface EstadoVacioProps {
  onSugerencia: (prompt: string) => void;
}

/** Estructura de una alerta o notificación mostrada al usuario */
export interface Alerta {
  id: string;
  tipo: 'nota' | 'evento';
  mensaje: string;
  fechaDate: Date;
  fechaTexto: string;
  link: string;
  leido: boolean;
  icono: React.ElementType;
}

/** Información geométrica y de identidad de una provincia española */
export interface ProvinceInfo {
  id: string;
  name: string;
  path: string;
}

/** Props del mapa interactivo SVG de España */
export interface SpainProvincesMapProps {
  activeId?: string | null;
  onProvinceClick?: (province: ProvinceInfo) => void;
  className?: string;
}

/** Props para la tabla de registros del mapa de calor */
export interface TablaRegistroMapaProps {
  registros: RegistroMapa[];
  onDelete: (id: number) => void;
  onEdit: (registro: RegistroMapa) => void;
  onDeleteSelected?: (ids: (string | number)[]) => void;
  onRowClick?: (registro: RegistroMapa) => void;
}

/** Props para la tabla de eventos registrados */
export interface TablaRegistroEventosProps {
  registros: RegistroEvento[];
  onDelete: (id: number) => void;
  onEdit: (registro: RegistroEvento) => void;
  onDeleteSelected?: (ids: (string | number)[]) => void;
  onRowClick?: (registro: RegistroEvento) => void;
}

/** Props para el modal genérico de detalles de registro */
export interface ModalDetalleRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  tipo: 'mapa' | 'evento' | 'eventos';
  onEdit?: () => void;
}

/** Props para el modal de creación/edición de Eventos */
export interface EventModalProps {
  event: any;
  isNew: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  onDelete: (event: any) => void;
  onFinalized: (id: number) => void;
  onShowError: (msg: string) => void;
  tiposEvento: TipoEvento[];
}

/** Props para el modal de confirmación genérico (Aceptar/Cancelar) */
export interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensaje: string;
  tipo?: 'danger' | 'warning' | 'info' | 'success';
}

/** Props para modal de edición rápida de cantidad de visitantes */
export interface ModalEditarCantidadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevaCantidad: number, nuevasObservaciones?: string) => void;
  cantidadActual: number;
  observacionesActuales?: string;
  titulo: string;
}

/** Props para el componente FullCalendar wrapper */
export interface CalendarioProps {
  eventos: any[];
  cargando?: boolean;
  onDateClick?: (arg: any) => void;
  onEventClick?: (arg: any) => void;
  onEventChange?: (arg: any) => void;
}

/** Props para una fila individual en la tabla de usuarios */
export interface UserRowProps {
  profile: Perfil;
  roles: Rol[];
  onAction: (action: string, profile: Perfil) => void;
}

/** Datos del formulario de registro rápido de visitantes */
export interface FormData {
  provincia: string;
  tipoVisita: 'individual' | 'grupo';
  numPersonas: number;
  pais: string;
  observaciones: string;
}

/** Props para el formulario de registro rápido */
export interface FormularioProps {
  provinciaInicial?: string;
  paisInicial?: string;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  mostrarObservaciones?: boolean;
  bloquearProvincia?: boolean;
  resetTrigger?: number;
}

/** Props para el formulario de alta de nuevo empleado/admin */
export interface FormularioRegistroProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

/** Props para el formulario de inicio de sesión */
export interface FormularioSesionProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onBack: () => void;
  logoUrl?: string;
  logoModoOscuroUrl?: string;
}

export interface LeyendaColoresProps {
  className?: string;
}

export interface UsersTableProps {
  users: Perfil[];
  roles: Rol[];
  onAction: (action: string, profile: Perfil) => void;
  onDeactivateSelected?: (ids: string[]) => void;
  onActivateSelected?: (ids: string[]) => void;
  currentUserId?: string;
}
