import React, { useState, useEffect } from "react";
import { ICONOS } from "@/constantes/iconos";

/**
 * Componente para alternar el tema de la aplicación.
 * Permite al usuario cambiar entre el modo claro y el modo oscuro (dark mode),
 * sincronizando la preferencia con `localStorage` y aplicando la clase CSS `dark` al documento raíz.
 * @returns Botón interactivo con iconos dinámicos (Sol/Luna).
 */
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <img src={ICONOS.sol} className="w-[26px] h-[26px] object-contain" alt="" />
      ) : (
        <img src={ICONOS.luna} className="w-[26px] h-[26px] object-contain" alt="" />
      )}
    </button>
  );
};
