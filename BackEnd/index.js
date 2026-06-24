const express = require('express');
const cors = require('cors');
const conexion = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ======================
// Rutas
// ======================
const dashboardRoutes = require("./routes/dashboard");
app.use("/api", dashboardRoutes);
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
const usuariosRoutes = require('./routes/usuarios');
app.use('/api', usuariosRoutes);
const clientesRoutes = require('./routes/clientes');
app.use('/api', clientesRoutes);
const proveedoresRoutes = require('./routes/proveedores');
app.use('/api', proveedoresRoutes);
const tablerosRoutes = require('./routes/tableros');
app.use('/api', tablerosRoutes);
const accesoriosRoutes = require('./routes/accesorios');
app.use('/api', accesoriosRoutes);
const cotizacionRoutes = require('./routes/cotizacion');
app.use('/api', cotizacionRoutes);
const trabajosRoutes = require('./routes/trabajos');
app.use('/api', trabajosRoutes);
const progresoRoutes = require('./routes/progreso');
app.use('/api', progresoRoutes);
const perfilRoutes = require("./routes/perfil");
app.use("/api", perfilRoutes);
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const auditoriaRoutes = require("./routes/auditoriaRoutes.js");
app.use("/api", auditoriaRoutes);
const reportesRoutes = require("./routes/reportes");
app.use("/api", reportesRoutes);

// ======================
// Servidor
// ======================
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});