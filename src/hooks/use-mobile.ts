import * as React from "react"

const MOBILE_BREAKPOINT = 1024

/**
 * Custom Hook para detectar si el usuario está navegando desde un dispositivo móvil o pantalla pequeña.
 * Muy útil para colapsar barras laterales (Sidebars) o cambiar layouts condicionalmente.
 * Considera móvil cualquier pantalla por debajo de 1024px.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
