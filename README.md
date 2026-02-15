# 🗺️ Visimap — Gestión de Visitantes y Personal

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react" alt="React Badge">
  <img src="https://img.shields.io/badge/Backend-Supabase-green?logo=supabase" alt="Supabase Badge">
  <img src="https://img.shields.io/badge/Estilos-TailwindCSS-38bdf8?logo=tailwindcss" alt="Tailwind Badge">
  <img src="https://img.shields.io/badge/Licencia-MIT-yellow" alt="License Badge">
</p>

> 🏢 **Visimap** es una solución integral para la gestión de visitantes y personal en el Museo MUVI de Vca.
> Permite registrar visitantes por provincia mediante un mapa interactivo, gestionar perfiles de empleados y organizar eventos mediante un calendario interactivo.

---

## 🌍 Descripción general
Visimap combina una arquitectura moderna y eficiente para ofrecer una experiencia de usuario fluida:
- 🔹 **Frontend:** React + Vite + TailwindCSS
- 🔹 **Backend:** Supabase (PostgreSQL + Auth + Storage)
- 🔹 **Gestión:** Mapas interactivos, control de usuarios y agenda de eventos
- 🔹 **Diseño:** Interfaz limpia, intuitiva y responsive
- 🔹 **Objetivo:** Facilitar el control de acceso y la gestión en el Museo MUVI

---

## 🧱 Estructura del proyecto
```bash
visimap/
│
├── public/               # Recursos estáticos (imágenes, logos...)
├── src/
│   ├── components/       # Componentes (Mapa, Calendario, Perfil, MenuLateral...)
│   ├── assets/           # Imágenes y recursos gráficos
│   ├── App.jsx           # Componente principal y lógica de enrutamiento
│   ├── main.jsx          # Punto de entrada de la aplicación
│   └── index.css         # Estilos globales de TailwindCSS
│
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración de TailwindCSS
├── vite.config.js        # Configuración de Vite
└── README.md             # Documentación del proyecto
```

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd visimap
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Ejecutar el entorno de desarrollo
```bash
npm run dev
```

El proyecto se abrirá en: `http://localhost:5173`

---

## 🗄️ Base de datos (Supabase)
La aplicación utiliza Supabase para la persistencia de datos y la autenticación segura.

**Tablas principales:**
| Tabla | Descripción |
|---|---|
| `profiles` | Información detallada de usuarios y empleados (nombre, rol, estado, avatar) |
| `visitas` | Registro de actividad y ubicación de visitantes |
| `eventos` | Datos del calendario para la agenda corporativa |

**Políticas de Seguridad (RLS):**
- Los datos están protegidos mediante Row Level Security.
- La autenticación gestiona sesiones y recuperación de contraseñas.

---

## 🧠 Tecnologías principales
| Tecnología | Uso |
|---|---|
| ⚛️ React + Vite | Desarrollo de interfaz de usuario rápido y modular |
| 🎨 TailwindCSS | Estilizado moderno y adaptativo |
| 🧰 Supabase | Backend as a Service (BaaS) para base de datos y autenticación |
| 🗺️ Lucide React | Iconografía vectorial ligera y consistente |
| 🎭 Framer Motion | Animaciones fluidas para la interfaz |

---

## 💻 Comandos útiles
| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Ejecutar en desarrollo | `npm run dev` |
| Construir para producción | `npm run build` |
| Previsualizar build | `npm run preview` |
| Linting (Sintaxis) | `npm run lint` |

---

## 🧩 Características implementadas
- ✅ **Dashboard Interactivo:** Vista principal con mapa de visitantes en tiempo real.
- ✅ **Gestión de Personal:** Administración de perfiles de usuario con roles y estados.
- ✅ **Calendario de Eventos:** Planificación y visualización de la agenda corporativa.
- ✅ **Perfil de Usuario:** Configuración personal y edición de datos.
- ✅ **Autenticación Completa:** Inicio de sesión, cierre de sesión y recuperación de contraseña.
- ✅ **Diseño Responsive:** Interfaz adaptada a diferentes tamaños de pantalla.

---

## 📚 Sesiones
- 13/01/2026 --> Reunión con el tutor del proyecto para enseyarle la landing page, formulario de inicio y dashboard con el mapa implementado. También para resolver algunas dudas del proyecto.
- 20/01/2026 --> Reunión con el tutor para mostrar la mejora del mapa con colores y leyenda
- 27/01/2026 --> Reunión con el tutor para mostrar que funciona correctamente el dashboard de registro de visitante. También le he consultado temas de mejoras de mi aplicativo, como por ejemplo, meter una sección de notas o correo interno. Consulta de a la hora de añadir un trabajador si debo de enviar un correo de confirmación o no para que se registre de forma correcta en la base de datos.
- 03/02/2026 --> Reunión con el tutor para mostrarle la insercción de trabajadores, el correo de invitación, el "eliminado" de un trabajador y que no te permite iniciar sesión y la modificación de datos de un trabajador mediante el menú del admin en trabajadores.

## 👩‍💻 Autoría
- **Desarrollador Principal**
- Desarrollo de Aplicaciones Web (DAW)
- Proyecto Intermodular

---

## 🏷️ Licencia
Este proyecto está distribuido bajo la Licencia MIT.
