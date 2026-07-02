const conexion = require("../db");

exports.obtenerResumen = (req, res) => {
    const datos = {};
    conexion.query(
        "SELECT COUNT(*) total FROM cotizaciones",
        (err, cot) => {
            if (err) return res.status(500).json(err);
            datos.cotizaciones = cot[0].total;

            conexion.query(
                "SELECT COUNT(*) total FROM trabajos",
                (err, trab) => {
                    if (err) return res.status(500).json(err);
                    datos.trabajos = trab[0].total;

                    conexion.query(
                        "SELECT COUNT(*) total FROM clientes",
                        (err, cli) => {
                            if (err) return res.status(500).json(err);
                            datos.clientes = cli[0].total;

                            conexion.query(
                                "SELECT COUNT(*) total FROM usuarios WHERE rol='EMPLEADO'",
                                (err, emp) => {
                                    if (err) return res.status(500).json(err);
                                    datos.empleados = emp[0].total;

                                    conexion.query(
                                        "SELECT SUM(total_final) total FROM cotizaciones",
                                        (err, fac) => {
                                            if (err) return res.status(500).json(err);
                                            datos.facturacion = fac[0].total || 0;
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
};

exports.obtenerCotizaciones = (req, res) => {
    const sql = `
        SELECT
            c.id_cotizacion,
            c.fecha,
            c.total_final,
            c.estado,
            cli.nombre AS cliente,
            tm.nombre AS tipo_mueble
        FROM cotizaciones c
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        ORDER BY c.id_cotizacion DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerMateriales = (req, res) => {
    const sql = `
        SELECT
            t.nombre,
            COUNT(*) veces
        FROM detalle_piezas_cotizacion d
        INNER JOIN tableros t ON d.id_tablero = t.id_tablero
        GROUP BY t.nombre
        ORDER BY veces DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerAccesorios = (req, res) => {
    const sql = `
        SELECT
            a.nombre,
            SUM(d.cantidad) veces
        FROM detalle_accesorios_cotizacion d
        INNER JOIN accesorios a ON d.id_accesorio = a.id_accesorio
        GROUP BY a.nombre
        ORDER BY veces DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerTrabajos = (req, res) => {
    const sql = `
        SELECT
            t.id_trabajo,
            cli.nombre cliente,
            t.estado,
            IF(t.estado = 'COMPLETADO', 100, CAST(COALESCE(
                (
                    SELECT SUM(a.porcentaje)
                    FROM avances a
                    WHERE a.id_trabajo = t.id_trabajo
                ),
                0
            ) AS SIGNED)) AS avance
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        ORDER BY t.id_trabajo DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};
