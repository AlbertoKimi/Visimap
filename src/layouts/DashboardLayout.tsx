import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '../components/app-sidebar';
import { NotificationBell } from '../components/ui/NotificationBell';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const DashboardLayout: React.FC = () => {
    const location = useLocation();

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('mapa')) return 'Mapa de Visitantes';
        if (path.includes('registro-visitante')) return 'Registro de Visitantes';
        if (path.includes('personal')) return 'Gestión de Personal';
        if (path.includes('eventos')) return 'Calendario de Eventos';
        if (path.includes('estadisticas')) return 'Gráficos Estadísticos';
        if (path.includes('notas')) return 'Notas y Tareas';
        if (path.includes('perfil')) return 'Configuración de Perfil';
        return 'Dashboard';
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col overflow-hidden w-full">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Visimap
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{getTitle()}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 bg-slate-50 relative">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};
