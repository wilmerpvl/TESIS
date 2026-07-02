require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conexion = require('./db');
const { verificarToken, verificarRol } = require("./middleware/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Log de peticiones para depuración
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    });
    next();
});

// ======================
// Rutas Públicas
// ======================
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes); // Contiene /login (Público)

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Evidencias fotográficas públicas

// ======================
// Middleware Global de Verificación de Token
// ======================
app.use('/api', verificarToken); // De aquí en adelante todas las rutas requieren sesión activa

// ======================
// Rutas Protegidas por Roles
// ======================

// Helper para aplicar verificación de rol únicamente si el segmento de la URL coincide
function verificarRolParaSegmento(rolesPermitidos, segmento) {
    const middleware = verificarRol(rolesPermitidos);
    return (req, res, next) => {
        const segments = req.originalUrl.split('?')[0].split('/');
        if (segments[2] === segmento) {
            return middleware(req, res, next);
        }
        next();
    };
}

// Dashboard y Reportes (Admin y Dueño)
const dashboardRoutes = require("./routes/dashboard");
app.use("/api", verificarRolParaSegmento(["ADMIN", "DUENO"], "dashboard"), dashboardRoutes);

const reportesRoutes = require("./routes/reportes");
app.use("/api", verificarRolParaSegmento(["ADMIN", "DUENO"], "reportes"), reportesRoutes);

// Usuarios y Auditoría (Únicamente Administrador)
const usuariosRoutes = require('./routes/usuarios');
app.use('/api', verificarRolParaSegmento(["ADMIN"], "usuarios"), usuariosRoutes);

const auditoriaRoutes = require("./routes/auditoriaRoutes.js");
app.use("/api", verificarRolParaSegmento(["ADMIN"], "auditoria"), auditoriaRoutes);

// Mantenedores: Clientes, Proveedores, Tableros, Accesorios (Admin y Dueño)
const clientesRoutes = require('./routes/clientes');
app.use('/api', verificarRolParaSegmento(["ADMIN", "DUENO"], "clientes"), clientesRoutes);

const proveedoresRoutes = require('./routes/proveedores');
app.use('/api', verificarRolParaSegmento(["ADMIN", "DUENO"], "proveedores"), proveedoresRoutes);

const tablerosRoutes = require('./routes/tableros');
app.use('/api', verificarRolParaSegmento(["ADMIN", "DUENO"], "tableros"), tablerosRoutes);

const accesoriosRoutes = require('./routes/accesorios');
app.use('/api', verificarRolParaSegmento(["ADMIN", "DUENO"], "accesorios"), accesoriosRoutes);

// Operaciones Generales (Admin, Dueño y Empleado)
const cotizacionRoutes = require('./routes/cotizacion');
app.use('/api', cotizacionRoutes);

const trabajosRoutes = require('./routes/trabajos');
app.use('/api', trabajosRoutes);

const progresoRoutes = require('./routes/progreso');
app.use('/api', progresoRoutes);

const perfilRoutes = require("./routes/perfil");
app.use("/api", perfilRoutes);

// ======================
// Servidor
// ======================
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});