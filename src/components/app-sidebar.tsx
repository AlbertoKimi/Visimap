
import { NavLink } from "react-router-dom"
import { LogOut, Map, UserPlus, Users, Calendar, BarChart3, StickyNote, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/authStore"
import { supabase } from "@/supabase/client"

export function AppSidebar() {
  const { userProfile, clearSession } = useAuthStore()
  const isAdmin = userProfile?.role_id === 1

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearSession()
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="h-auto py-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <NavLink to="/dashboard/mapa">
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Avatar"
                    className="flex aspect-square size-12 items-center justify-center rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-slate-200 text-slate-600 text-lg font-bold">
                    {userProfile?.nombre?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                  <span className="truncate font-semibold text-base">
                    {userProfile?.nombre || "Usuario"}
                  </span>
                  <span className="truncate text-xs">
                    {isAdmin ? "Administrador" : "Trabajador"}
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm pb-2">Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Mapa Interactivo" 
                  className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                >
                  <NavLink to="/dashboard/mapa">
                    <Map />
                    <span>Mapa Interactivo</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Registro Visitante" 
                    className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                  >
                    <NavLink to="/dashboard/registro-visitante">
                      <UserPlus />
                      <span>Registro Visitante</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Trabajadores" 
                    className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                  >
                    <NavLink to="/dashboard/personal">
                      <Users />
                      <span>Trabajadores</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Eventos" 
                  className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                >
                  <NavLink to="/dashboard/eventos">
                    <Calendar />
                    <span>Eventos</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Gráficas" 
                    className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                  >
                    <NavLink to="/dashboard/estadisticas">
                      <BarChart3 />
                      <span>Gráficas</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Notas" 
                  className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                >
                  <NavLink to="/dashboard/notas">
                    <StickyNote />
                    <span>Notas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sm pb-2">Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Editar Perfil" 
                  className="h-11 text-[15px] [&>svg]:size-5 gap-3 hover:bg-blue-50 hover:text-blue-600 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-600 aria-[current=page]:font-semibold aria-[current=page]:shadow-sm transition-colors"
                >
                  <NavLink to="/dashboard/perfil">
                    <Settings />
                    <span>Editar Perfil</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-11 justify-center text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 font-medium"
            >
              <LogOut className="mr-2 size-5" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
