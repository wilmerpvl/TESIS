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


// Dashboard
app.get('/api/dashboard', (req, res) => {
    const datos = {};

    conexion.query("SELECT COUNT(*) total FROM cotizaciones", (err, cot) => {
        if (err) return res.status(500).json(err);

        datos.cotizaciones = cot[0].total;

        conexion.query("SELECT COUNT(*) total FROM trabajos WHERE estado='EN_PROCESO'", (err, trab) => {
            if (err) return res.status(500).json(err);

            datos.trabajos = trab[0].total;

            conexion.query("SELECT COUNT(*) total FROM usuarios WHERE rol='EMPLEADO'", (err, emp) => {
                if (err) return res.status(500).json(err);

                datos.empleados = emp[0].total;

                conexion.query("SELECT AVG(porcentaje) promedio FROM avances", (err, av) => {
                    if (err) return res.status(500).json(err);

                    datos.avance = Math.round(av[0].promedio || 0);

                    res.json(datos);
                });
            });
        });
    });
});

// ======================
// Servidor
// ======================
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});