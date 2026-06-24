const express = require("express");
const router = express.Router();

const conexion = require("../db");


// DASHBOARD

router.get("/dashboard", (req, res) => {

    const datos = {};

    // Cotizaciones
    conexion.query(
        "SELECT COUNT(*) total FROM cotizaciones",
        (err, cot) => {

            if (err)
                return res.status(500).json(err);

            datos.cotizaciones =
                cot[0].total;

            // Trabajos
            conexion.query(
                `
                SELECT COUNT(*) total
                FROM trabajos
                WHERE estado='EN_PROCESO'
                `,
                (err, trab) => {

                    if (err)
                        return res.status(500).json(err);

                    datos.trabajos =
                        trab[0].total;

                    // Clientes
                    conexion.query(
                        `
                        SELECT COUNT(*) total
                        FROM clientes
                        `,
                        (err, cli) => {

                            if (err)
                                return res.status(500).json(err);

                            datos.clientes =
                                cli[0].total;

                            // Empleados
                            conexion.query(
                                `
                                SELECT COUNT(*) total
                                FROM usuarios
                                WHERE rol='EMPLEADO'
                                `,
                                (err, emp) => {

                                    if (err)
                                        return res.status(500).json(err);

                                    datos.empleados =
                                        emp[0].total;

                                    // Avance promedio
                                    conexion.query(
                                        `
                                        SELECT ROUND(IFNULL(AVG(avance_acumulado), 0)) AS promedio
                                        FROM (
                                            SELECT t.id_trabajo,
                                                   IF(t.estado = 'COMPLETADO', 100, CAST(COALESCE(
                                                       (SELECT SUM(a.porcentaje) FROM avances a WHERE a.id_trabajo = t.id_trabajo), 0
                                                   ) AS SIGNED)) AS avance_acumulado
                                            FROM trabajos t
                                        ) AS t_avances
                                        `,
                                        (err, av) => {

                                            if (err)
                                                return res.status(500).json(err);

                                            datos.avance =
                                                av[0].promedio || 0;

                                            // Facturación
                                            conexion.query(
                                                `
                                                SELECT
                                                IFNULL(
                                                    SUM(total_final),
                                                    0
                                                ) total
                                                FROM cotizaciones
                                                `,
                                                (err, fact) => {

                                                    if (err)
                                                        return res.status(500).json(err);

                                                    datos.facturado =
                                                        fact[0].total || 0;

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

});

module.exports = router;