# Sistema Web para la Automatización de Cotizaciones, Gestión de Materiales y Control de Producción

Este repositorio contiene el prototipo de sistema web a medida diseñado para digitalizar y optimizar los flujos comerciales y operativos en un negocio de fabricación de muebles personalizados. El sistema permite registrar clientes y proveedores, administrar el catálogo técnico de insumos (tableros y accesorios), cotizar muebles de forma automatizada mediante un lienzo interactivo en dos dimensiones, y realizar el seguimiento en tiempo real del progreso físico de los trabajos en el taller con evidencia fotográfica.

Desarrollado como Proyecto de Integración Curricular para la obtención del título de **Ingeniero en Software** en la **Universidad de Guayaquil**.

---

## 🛠️ Tecnologías Utilizadas

El sistema se construyó bajo una arquitectura cliente-servidor de tres capas utilizando herramientas de código abierto basadas en JavaScript:

### Frontend
* ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **React.js (v18+)** - Librería para la interfaz de usuario basada en componentes reutilizables.
* ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) **Vite** - Servidor de desarrollo y empaquetador del proyecto.
* ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) **CSS Vainilla** - Hojas de estilo personalizadas y adaptativas (responsivas) para móviles y PC.
* **Canvas API** - Renderizado bidimensional interactivo para la distribución del plano de corte de tableros.
* **jsPDF** - Generación y exportación de reportes y presupuestos estructurados a formato PDF.
* **Axios** - Cliente HTTP para la comunicación asíncrona con la API del servidor.

### Backend
* ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) **Node.js** - Entorno de ejecución en tiempo real del lado del servidor.
* ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) **Express.js** - Framework para la creación de la API REST.
* **Sequelize** - ORM para el mapeo objeto-relacional y validación en la gestión de usuarios.
* **JSON Web Tokens (JWT)** - Autenticación y control de accesos basados en roles seguros.
* **Bcrypt** - Encriptación unidireccional de contraseñas de usuarios.

### Base de Datos
* ![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white) **MySQL (v8+)** - Sistema de gestión de bases de datos relacionales.

---

## 📁 Estructura del Repositorio

El proyecto se divide en dos módulos independientes:

```text
├── BackEnd/               # Servidor Node.js, Express y configuración de base de datos
│   ├── config/            # Configuraciones de conexión (Sequelize)
│   ├── controllers/       # Lógica de negocio y controladores de API
│   ├── models/            # Modelos de datos del ORM
│   ├── routes/            # Endpoints de la API REST
│   ├── db.js              # Archivo de conexión directo mediante mysql2 pool
│   ├── index.js           # Punto de entrada de la aplicación
│   └── .env.template      # Plantilla de variables de entorno
│
├── frontend-react/        # Interfaz de usuario en React y empaquetado Vite
│   ├── src/
│   │   ├── components/    # Componentes comunes (Sidebar, Navbar, Canvas)
│   │   ├── css/           # Archivos CSS personalizados
│   │   ├── pages/         # Pantallas principales (Login, Cotizaciones, Trabajos)
│   │   └── App.jsx        # Enrutador y raíz del frontend
│
└── sistema_muebles.sql    # Script de base de datos e inicialización de tablas
```

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
* **Node.js** (Versión 16.x o superior) instalado.
* **MySQL Server** (Versión 8.0 o superior) corriendo localmente.

### Paso 1: Configurar la Base de Datos
1. Inicia sesión en tu terminal de MySQL o herramienta administrativa (ej. MySQL Workbench).
2. Ejecuta el archivo script `sistema_muebles.sql` provisto en la raíz del repositorio para crear la base de datos `sistema_muebles` y todas sus tablas con la estructura normalizada:
   ```bash
   mysql -u root -p < sistema_muebles.sql
   ```

### Paso 2: Configurar y Ejecutar el Backend
1. Navega al directorio del backend:
   ```bash
   cd BackEnd
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de la carpeta `BackEnd` basándote en la plantilla `.env.template` e ingresa tus credenciales locales:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_contraseña_mysql
   DB_NAME=sistema_muebles
   DB_PORT=3306
   JWT_SECRET=tu_clave_secreta_jwt
   ```
4. Inicia el servidor en modo desarrollo:
   ```bash
   npm start
   ```
   El backend se levantará en el puerto `3000` (http://localhost:3000).

### Paso 3: Configurar y Ejecutar el Frontend
1. Abre una nueva terminal en la raíz del repositorio y navega al frontend:
   ```bash
   cd frontend-react
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   El frontend estará accesible desde tu navegador en http://localhost:5173.

---

## 🔒 Roles de Usuario por Defecto
El sistema cuenta con tres roles diferenciados para el control de accesos:
* **Administrador (ADMIN):** Acceso a todas las funciones, incluyendo bitácora de auditoría y alta/baja de usuarios.
* **Dueño (DUENO):** Control total de cotizaciones, catálogos (clientes, proveedores, tableros, accesorios) y reportes de facturación.
* **Empleado (EMPLEADO):** Acceso restringido para cotizar y actualizar el progreso físico de los trabajos con carga de fotos desde el taller.

---

## 🌐 Notas de Despliegue en Producción (AWS)

Para el despliegue en producción en una instancia de Amazon Web Services (AWS EC2):
* **Servidor Web:** Nginx configurado como proxy inverso para redireccionar las llamadas HTTP del puerto 80 a la carpeta `dist` de React y las llamadas `/api` al puerto 3000 del backend.
* **Gestor de Procesos:** PM2 configurado para ejecutar el servidor de Node (`index.js`) en segundo plano las 24 horas del día.
* **Optimización de Memoria:** Memoria Virtual de intercambio Swap de 1GB en Ubuntu para garantizar la correcta compilación de Vite sin cuelgues del sistema.

---

## 👥 Autores
* **Richard Pablo Villon Lavayen**
* **Wilmer Pedro Villon Lavayen**
* **Tutor:** Ing. Karla Yadira Abad Sacoto  
**Universidad de Guayaquil** - Carrera de Software (2026)
