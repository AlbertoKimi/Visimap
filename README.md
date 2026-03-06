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
├── docs/                 # Documentación del proyecto
├── public/               # Recursos estáticos (imágenes, logos...)
├── src/
│   ├── components/       # Componentes reutilizables (Botones, Inputs, Mapas...)
│   ├── pages/            # Vistas principales (Login, Perfil, Usuarios...)
│   ├── utils/            # Funciones de utilidad y cliente Supabase
│   ├── App.jsx           # Componente principal y rutas
│   └── main.jsx          # Punto de entrada
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

- 07/10/2025 --> **Creación de una imagen corporativa**, desarrollando la identidad visual, el logotipo y la paleta de colores.
- 14/10/2025 --> Elaboración y **creación de contrato de prestación de servicios informáticos** para definir el alcance del proyecto.
- 21/10/2025 --> Redacción del **acta de reuniones** para la validación técnica inicial.
- 23/10/2025 --> **Puesta en marcha de la idea de nuestro proyecto**, definiendo la planificación y distribución de tareas.
- 28/10/2025 --> Definición de los **requisitos funcionales y no funcionales** del aplicativo, documentando todas las necesidades técnicas.
- 04/11/2025 --> **Presentación de nuestra idea de proyecto**, exponiendo los objetivos y comenzando el diseño de las interfaces y la arquitectura visual (*Atomic Design*).
- 25/11/2025 --> **Creación de la base de datos (modelo entidad relación)**, estructurando el esquema principal del sistema.
- 02/12/2025 --> **Presentación de la base de datos**, mostrando de forma exhaustiva los campos, tablas y las relaciones elegidas.
- 09/12/2025 --> **Optimización del modelo relacional** y revisión de la lógica de negocio para mejorar su robustez.
- 16/12/2025 --> Revisión final del planteamiento del proyecto y cierre de la primera fase antes de iniciar el desarrollo técnico del año siguiente.
- 13/01/2026 --> **Presentación del primer prototipo funcional al tutor del proyecto**. Se exhibió la *landing page*, el formulario de acceso y la integración inicial del dashboard con el mapa interactivo. Resolución de dudas técnicas sobre la arquitectura.
- 20/01/2026 --> **Revisión de la visualización de datos geoespaciales**. Demostración de las mejoras implementadas en el mapa interactivo, incluyendo la asignación dinámica de colores y la inclusión de una leyenda explicativa.
- 27/01/2026 --> **Validación del módulo de visitantes**. Pruebas de funcionamiento del dashboard para el registro de usuarios. Se plantearon propuestas de escalabilidad (como un buzón de mensajería interna) y se analizó el flujo de validación por correo electrónico en alta de trabajadores.
- 03/02/2026 --> **Presentación del módulo de gestión de personal**. Demostración del ciclo de vida de la cuenta de un empleado: inserción inicial, envío automático de invitaciones, edición mediante el panel de administrador y medidas de seguridad para la restricción de acceso (bajas).
- 10/02/2026 --> **Desarrollo del flujo de invitación por correo**. Creación de la interfaz mediante la cual los empleados completan su registro tras recibir la invitación. Paralelamente, se llevó a cabo una **optimización de los formularios** para garantizar una experiencia de usuario (UX) más intuitiva.
- 17/02/2026 --> **Refactorización visual de la *landing page***. Mejora del diseño y la presentación del producto corporativo. Refinamiento de las validaciones de seguridad e interacción en los formularios de autenticación.
- 24/02/2026 --> **Elaboración del manual técnico y del manual de proyecto**. Documentación de la arquitectura del software, configuración del entorno de desarrollo y justificación de las decisiones técnicas adoptadas a lo largo del desarrollo.
- 03/03/2026 --> **Redacción de la documentación de usuario**. Creación de una guía detallada para la operación y explotación del sistema, ilustrando cómo gestionar adecuadamente el mapa, los registros de visitantes y el calendario de eventos.

## 👩‍💻 Autoría
- **Desarrollador Principal**
- Desarrollo de Aplicaciones Web (DAW)
- Proyecto Intermodular

---

## 🏷️ Licencia
Este proyecto está distribuido bajo la Licencia MIT.
