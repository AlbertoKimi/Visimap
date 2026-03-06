<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map-pinned.svg" alt="Visimap Logo" width="120" height="120" style="margin-bottom: 20px;">

  # Visimap
  **Plataforma Integral de Gestión de Visitantes y Personal**

  <p align="center" style="margin-top: 15px;">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  </p>

  <p align="center">
    <em>Solución de software diseñada para optimizar la gestión de accesos,<br>flujos de visitantes y organización del personal en el Museo MUVI.</em>
  </p>

</div>

<br>

<details open>
  <summary><b>📑 Índice de Contenidos</b></summary>
  <ol>
    <li><a href="#-descripción-general">Descripción General</a></li>
    <li><a href="#-características-implementadas">Características Implementadas</a></li>
    <li><a href="#-tecnologías-principales">Tecnologías Principales</a></li>
    <li><a href="#-estructura-del-proyecto">Estructura del Proyecto</a></li>
    <li><a href="#-instalación-y-despliegue">Instalación y Despliegue</a></li>
    <li><a href="#-comandos-útiles">Comandos Útiles</a></li>
    <li><a href="#-modelo-de-datos">Modelo de Datos</a></li>
    <li><a href="#-registro-de-sesiones-de-trabajo">Registro de Sesiones de Trabajo</a></li>
    <li><a href="#-autoría-y-licencia">Autoría y Licencia</a></li>
  </ol>
</details>

<br>

## 🎯 Descripción General
Visimap consolida un sistema escalable y eficiente para ofrecer una experiencia de usuario optimizada en entornos de alta concurrencia. Su propósito principal es facilitar el control de acceso fluido y mejorar la toma de decisiones basada en datos geográficos y organizativos.

<br>

## ✨ Características Implementadas
El sistema incluye las siguientes funcionalidades clave para la operativa diaria del museo:

- 📊 **Dashboard Analítico:** Visualización en tiempo real de métricas y distribución geográfica de visitantes mediante mapas interactivos.
- 👥 **Gestión de Personal:** Sistema robusto de administración para perfiles de usuario, con asignación de roles corporativos y control de estados (activo/inactivo).
- 📅 **Calendario de Eventos:** Planificación, visualización y seguimiento integral de la agenda corporativa.
- ✉️ **Sistema de Invitaciones:** Flujo seguro por correo electrónico para que los empleados configuren sus credenciales en su primer acceso.
- 🔐 **Autenticación Completa:** Inicio de sesión seguro, gestión de la sesión y flujos de recuperación de contraseñas.
- 📱 **Diseño Responsive:** Interfaz *mobile-first* implementada para garantizar su visualización óptima en pantallas de cualquier formato.

<br>

## 🛠️ Tecnologías Principales
La plataforma se fundamenta en un modelo de arquitectura moderna separando claramente la lógica de presentación de los servicios de backend.

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Construcción de interfaces dinámicas y alto rendimiento de compilación. |
| **Estilos** | TailwindCSS | Sistema de diseño ágil mediante utilidades CSS corporativas y adaptativas. |
| **Backend / BaaS** | Supabase | Proveedor de base de datos (PostgreSQL) y autenticación segura. |
| **UI e Iconos** | Lucide React | Biblioteca de iconografía vectorial estandarizada y minimalista. |
| **Animaciones** | Framer Motion | Transiciones modulares y fluidas para el enriquecimiento visual de la interfaz. |

<br>

## 📂 Estructura del Proyecto
Organización modular de los directorios siguiendo las mejores prácticas de desarrollo en React.

```bash
visimap/
├── docs/                 # Documentación técnica y manuales corporativos
├── public/               # Assets estáticos (imágenes, logos del museo)
├── src/
│   ├── components/       # Componentes atómicos e independientes (Inputs, Botones)
│   ├── pages/            # Vistas principales y contenedores de ruta
│   ├── utils/            # Configuración de clientes (Supabase) y lógicas de validación
│   ├── App.jsx           # Enrutador principal y configuración de dependencias
│   └── main.jsx          # Punto de entrada de la aplicación
│
├── .env                  # Variables de entorno seguras (Claves de Supabase)
├── tailwind.config.js    # Definición del sistema de diseño (tokens)
└── vite.config.js        # Configuración del empaquetador
```

<br>

## 🚀 Instalación y Despliegue

### Requisitos Previos
* Node.js (v18 o superior)
* Gestor de paquetes `npm`

### Pasos de Instalación
1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd visimap
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crear un archivo `.env` en la raíz del proyecto y definir las referencias al backend:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Ejecutar el entorno de desarrollo:**
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en `http://localhost:5173`.*

<br>

## 💻 Comandos Útiles

Tabla de referencias rápidas para la operativa sobre el código base:

| Acción | Comando | Descripción |
| :--- | :--- | :--- |
| **Instalación** | `npm install` | Descarga e instala los módulos y dependencias de NPM. |
| **Desarrollo** | `npm run dev` | Lanza el servidor de Vite en caliente (HMR). |
| **Compilación** | `npm run build` | Genera la carpeta `/dist` optimizada para producción. |
| **Previsualización**| `npm run preview` | Levanta un servidor sobre los estáticos de la última compilación. |
| **Análisis** | `npm run lint` | Comprueba la calidad y el estándar de sintaxis del código. |

<br>

## 🗄️ Modelo de Datos
La persistencia y seguridad de la información está delegada en Supabase (PostgreSQL). Toda la información está protegida mediante **Row Level Security (RLS)** y manejada por políticas de control de acceso.

| Entidad | Descripción |
| :--- | :--- |
| `profiles` | Gestión centralizada de la identidad del personal. Almacena nombres, roles corporativos, estados de sesión y avatares. |
| `visitas` | Entidad transaccional para el registro de accesos y procedencia geográfica de los visitantes del museo. |
| `eventos` | Registro temporal y descriptivo de la planificación del calendario interno. |

<br>

## 📅 Registro de Sesiones de Trabajo

### Fase de Planificación y Diseño (2025)
> Desarrollo conceptual, diseño de arquitectura y modelado de datos.

- **07/10/2025** · **Creación de una imagen corporativa**: Desarrollo de la identidad visual, conceptualización del logotipo y definición de la paleta de colores.
- **14/10/2025** · **Contrato de prestación de servicios**: Elaboración del documento legal para definir el alcance, términos y condiciones del proyecto informático.
- **21/10/2025** · **Acta de reuniones**: Redacción formal del documento para la validación técnica inicial y registro de acuerdos.
- **23/10/2025** · **Puesta en marcha del proyecto**: Definición de la planificación estratégica, cronograma y distribución de tareas del equipo.
- **28/10/2025** · **Requisitos funcionales y no funcionales**: Levantamiento de requerimientos y documentación exhaustiva de las especificaciones y limitantes técnicas del sistema.
- **04/11/2025** · **Presentación del proyecto**: Exposición de los objetivos principales e inicio del diseño de interfaces bajo la metodología de *Atomic Design*.
- **25/11/2025** · **Diseño de Base de Datos**: Creación del modelo Entidad-Relación y estructuración preliminar del esquema principal del sistema.
- **02/12/2025** · **Presentación del Modelo de Datos**: Demostración y defensa de la arquitectura de datos, exponiendo tablas, campos y relaciones establecidas.
- **09/12/2025** · **Optimización del esquema relacional**: Revisión final de la lógica de negocio, normalización y mejora de la robustez de la base de datos.
- **16/12/2025** · **Cierre de Fase 1**: Revisión global del planteamiento del proyecto y validación antes de dar paso a la implementación técnica del Frontend/Backend.

### Fase de Desarrollo y Despliegue (2026)
> Implementación de código, integración continua y validación de prototipos.

- **13/01/2026** · **Presentación del primer prototipo funcional**. Exhibición formal ante la tutoría del proyecto de la *landing page*, el formulario de acceso y la integración inicial del dashboard interactivo. Resolución de dudas de arquitectura.
- **20/01/2026** · **Revisión de visualización de datos**. Demostración de las mejoras aplicadas al mapa geoespacial, incluyendo asignación dinámica de colores y renderizado de leyendas.
- **27/01/2026** · **Validación de módulos**. Pruebas en entornos reales del dashboard de visitantes. Análisis de propuestas de escalabilidad (mensajería interna) y debate sobre el flujo de validación de cuentas por correo.
- **03/02/2026** · **Presentación de la gestión de personal**. Demostración completa del ciclo de vida de usuarios: alta, envío automático de invitaciones, edición desde el panel de administrador y revocación de accesos.
- **10/02/2026** · **Desarrollo del flujo de invitaciones**. Creación de las vistas específicas para la configuración de credenciales de nuevos empleados. Optimización general de la UX/UI de los formularios de la plataforma.
- **17/02/2026** · **Refactorización de la *Landing Page***. Pulido del diseño corporativo, asegurando una presentación de alto impacto visual. Implementación de validaciones robustas de los esquemas de autenticación.
- **24/02/2026** · **Elaboración de manuales**. Documentación exhaustiva en el manual técnico y el manual de proyecto: arquitectura, infraestructura, configuración y justificación de stack tecnológico.
- **03/03/2026** · **Redacción de documentación de usuario**. Publicación de la guía de explotación operativa del sistema, orientada a formar a los operadores del museo en el uso del mapa, registros y agenda.

<br>

## 👨‍💻 Autoría y Licencia

<img src="https://img.shields.io/badge/Proyecto-Intermodular-004481?style=flat-square&logo=react&logoColor=white" align="right" />

**Desarrollado por:**
* **Desarrollador Principal** — *Alumno de Desarrollo de Aplicaciones Web (DAW)*

<br>

**Licencia:**  
Distribuido bajo la [Licencia MIT](https://opensource.org/licenses/MIT). Se permite el uso comercial, modificación y distribución del software.

