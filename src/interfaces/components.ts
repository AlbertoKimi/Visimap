import { Session } from '@supabase/supabase-js';
import { Perfil } from "@/interfaces/Perfil";
import { Rol } from "@/interfaces/Rol";

export interface LandingPageProps {
  onGetStarted: () => void;
}

export interface EstablecerContrasenaProps {
  session: Session | null;
  onComplete?: () => void;
}

export interface DetalleUsuarioProps {
  user: Perfil;
  initialMode?: string;
  roles: Rol[];
  onBack: () => void;
  onUpdate: () => void;
  mostrarNotificacion: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info') => void;
  hideBack?: boolean;
}

export interface MenuLateralProps {
  userProfile: Perfil | null;
  logoUrl?: string;
}

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

export interface EstadoVacioProps {
  onSugerencia: (prompt: string) => void;
}

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

export interface ProvinceInfo {
  id: string;
  name: string;
  path: string;
}

export interface SpainProvincesMapProps {
  activeId?: string | null;
  onProvinceClick?: (province: ProvinceInfo) => void;
  className?: string;
}

import { RegistroMapa } from "@/interfaces/Visitor";

export interface TablaRegistroMapaProps {
  registros: RegistroMapa[];
  onDelete: (id: number) => void;
  onEdit: (registro: RegistroMapa) => void;
  onDeleteSelected?: (ids: (string | number)[]) => void;
  onRowClick?: (registro: RegistroMapa) => void;
}

import { RegistroEvento, TipoEvento } from "@/interfaces/Evento";

export interface TablaRegistroEventosProps {
  registros: RegistroEvento[];
  onDelete: (id: number) => void;
  onEdit: (registro: RegistroEvento) => void;
  onDeleteSelected?: (ids: (string | number)[]) => void;
  onRowClick?: (registro: RegistroEvento) => void;
}

export interface ModalDetalleRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  tipo: 'mapa' | 'evento' | 'eventos';
}

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

export interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensaje: string;
  tipo?: 'danger' | 'warning' | 'info';
}

export interface ModalEditarCantidadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevaCantidad: number) => void;
  cantidadActual: number;
  titulo: string;
}

export interface CalendarioProps {
  eventos: any[];
  cargando?: boolean;
  onDateClick?: (arg: any) => void;
  onEventClick?: (arg: any) => void;
  onEventChange?: (arg: any) => void;
}

export interface UserRowProps {
  profile: Perfil;
  roles: Rol[];
  onAction: (action: string, profile: Perfil) => void;
}

export interface FormData {
  provincia: string;
  tipoVisita: 'individual' | 'grupo';
  numPersonas: number;
  pais: string;
  observaciones: string;
}

export interface FormularioProps {
  provinciaInicial?: string;
  paisInicial?: string;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  mostrarObservaciones?: boolean;
  bloquearProvincia?: boolean;
  resetTrigger?: number;
}

export interface FormularioRegistroProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  mostrarNotificacion: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

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
}
