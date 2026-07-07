const conexion = require("../db");

exports.obtenerDashboard = (req, res) => {
    const datos = {};

    // Cotizaciones
    conexion.query(
        "SELECT COUNT(*) total FROM cotizaciones",
        (err, cot) => {
            if (err) return res.status(500).json(err);
            datos.cotizaciones = cot[0].total;

            // Trabajos
            conexion.query(
                `
                SELECT COUNT(*) total
                FROM trabajos
                WHERE estado='EN_PROCESO'
                `,
                (err, trab) => {
                    if (err) return res.status(500).json(err);
                    datos.trabajos = trab[0].total;

                    // Clientes
                    conexion.query(
                        `
                        SELECT COUNT(*) total
                        FROM clientes
                        `,
                        (err, cli) => {
                            if (err) return res.status(500).json(err);
                            datos.clientes = cli[0].total;

                            // Empleados
                            conexion.query(
                                `
                                SELECT COUNT(*) total
                                FROM usuarios
                                WHERE rol='EMPLEADO'
                                `,
                                (err, emp) => {
                                    if (err) return res.status(500).json(err);
                                    datos.empleados = emp[0].total;

                                     // Facturacion
                                     conexion.query(
                                         `
                                         SELECT SUM(c.total_final) total
                                         FROM cotizaciones c
                                         INNER JOIN trabajos t ON c.id_cotizacion = t.id_cotizacion
                                         `,
                                         (err, fac) => {
                                             if (err) return res.status(500).json(err);
                                             datos.facturacion = fac[0].total || 0;
                                             datos.facturado = fac[0].total || 0; // Mapping for frontend

                                            // Promedio Avance Real Acumulado de Trabajos
                                            conexion.query(
                                                `
                                                SELECT 
                                                    AVG(
                                                        IF(
                                                            t.estado = 'COMPLETADO', 
                                                            100, 
                                                            COALESCE((SELECT SUM(a.porcentaje) FROM avances a WHERE a.id_trabajo = t.id_trabajo), 0)
                                                        )
                                                    ) AS promedio
                                                FROM trabajos t
                                                `,
                                                (err, prom) => {
                                                    if (err) return res.status(500).json(err);
                                                    datos.promedioAvance = prom[0].promedio || 0;
                                                    datos.avance = prom[0].promedio || 0; // Mapping for frontend
                                                    res.json(datos);
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};
