const express = require('express');
const router = express.Router();
const registrarAuditoria = require("./auditoria");
const conexion = require('../db');
// TIPOS DE MUEBLE
router.get('/tipos-mueble', (req, res) => {
    conexion.query(
        'SELECT * FROM tipos_mueble ORDER BY nombre ASC',
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// SECCIONES
router.get('/secciones', (req, res) => {
    conexion.query(
        'SELECT * FROM secciones_mueble ORDER BY id_seccion ASC',
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// MODULOS POR TIPO Y SECCION
router.get('/modulos/:idTipo/:idSeccion', (req, res) => {
    const { idTipo, idSeccion } = req.params;
    const sql = `
        SELECT *
        FROM modulos
        WHERE id_tipo = ?
        AND id_seccion = ?
        ORDER BY nombre ASC
    `;
    conexion.query(
        sql,
        [idTipo, idSeccion],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// PIEZAS POR MODULO
router.get('/piezas/:idModulo', (req, res) => {
    const { idModulo } = req.params;
    const sql = `
        SELECT *
        FROM piezas_modulo
        WHERE id_modulo = ?
        ORDER BY nombre ASC
    `;
    conexion.query(
        sql,
        [idModulo],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// TABLEROS PARA COTIZACION
router.get('/tableros-cotizacion', (req, res) => {
    const sql = `
        SELECT 
            t.*,
            p.nombre AS proveedor
        FROM tableros t
        LEFT JOIN proveedores p
        ON t.id_proveedor = p.id_proveedor
        WHERE t.estado = 1
        ORDER BY t.tipo ASC, t.color ASC
    `;
    conexion.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// ACCESORIOS PARA COTIZACION
router.get('/accesorios-cotizacion', (req, res) => {
    const sql = `
        SELECT 
            a.*,
            p.nombre AS proveedor
        FROM accesorios a
        LEFT JOIN proveedores p
        ON a.id_proveedor = p.id_proveedor
        WHERE a.estado = 1
        ORDER BY a.categoria ASC, a.nombre ASC
    `;
    conexion.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// CLIENTES PARA COTIZACION
router.get('/clientes-cotizacion', (req, res) => {
    conexion.query(
        'SELECT * FROM clientes WHERE estado = 1 ORDER BY nombre ASC',
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// MODULO COMPLETO
router.get('/modulo-completo/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT 
            m.nombre AS modulo,
            p.id_pieza,
            p.nombre AS pieza
        FROM modulos m
        LEFT JOIN piezas_modulo p
        ON m.id_modulo = p.id_modulo
        WHERE m.id_modulo = ?
    `;
    conexion.query(sql, [id], (err, result) => {
        if(err){
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// GUARDAR COTIZACION
router.post('/guardar-cotizacion', (req, res) => {
    const {
        id_cliente,
        id_tipo,
        total_tableros,
        total_accesorios,
        mano_obra,
        transporte,
        total_final,
        detalles,
        accesorios,
        id_usuario // Recibimos el id_usuario en el body
    } = req.body;
    const sqlCotizacion = `
        INSERT INTO cotizaciones
        (
            id_cliente,
            id_tipo,
            fecha,
            total_tableros,
            total_accesorios,
            mano_obra,
            transporte,
            total_final
        )
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
    `;
    conexion.query(
        sqlCotizacion,
        [
            id_cliente,
            id_tipo,
            total_tableros,
            total_accesorios,
            mano_obra,
            transporte,
            total_final
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            const idCotizacion = result.insertId;
            // GUARDAR DETALLES PIEZAS
            if (detalles && detalles.length > 0) {
                detalles.forEach(det => {
                    const sqlDetalle = `
                        INSERT INTO detalle_piezas_cotizacion
                        (
                            id_cotizacion,
                            id_modulo,
                            id_pieza,
                            id_tablero,
                            ancho,
                            alto,
                            cantidad,
                            costo,
                            observacion
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    conexion.query(
                        sqlDetalle,
                        [
                            idCotizacion,
                            det.id_modulo,
                            det.id_pieza,
                            det.id_tablero,
                            det.ancho,
                            det.alto,
                            det.cantidad,
                            det.costo,
                            det.observacion || ''
                        ]
                    );
                });
            }
            // GUARDAR ACCESORIOS
            if (accesorios && accesorios.length > 0) {
                accesorios.forEach(acc => {
                    const sqlAccesorio = `
                        INSERT INTO detalle_accesorios_cotizacion
                        (
                            id_cotizacion,
                            id_accesorio,
                            cantidad,
                            subtotal
                        )
                        VALUES (?, ?, ?, ?)
                    `;
                    conexion.query(
                        sqlAccesorio,
                        [
                            idCotizacion,
                            acc.id_accesorio,
                            acc.cantidad,
                            acc.subtotal
                        ]
                    );
                });
            }
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    "Generó cotización #" + idCotizacion
                );
            }
            res.json({
                message: 'Cotización guardada correctamente'
            });
        }
    );
});
// OBTENER DETALLE COMPLETO DE UNA COTIZACIÓN POR ID (Para reportes y facturas en PDF)
router.get("/cotizacion-detalle/:id", (req, res) => {
    const { id } = req.params;

    const sqlCotizacion = `
        SELECT
            c.*,
            cli.nombre AS cliente,
            cli.correo AS cliente_correo,
            cli.telefono AS cliente_telefono,
            tm.nombre AS tipo_mueble
        FROM cotizaciones c
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE c.id_cotizacion = ?
    `;

    conexion.query(sqlCotizacion, [id], (err, rowsCot) => {
        if (err) return res.status(500).json(err);
        if (rowsCot.length === 0) return res.status(404).json({ mensaje: "Cotización no encontrada" });

        const cotizacion = rowsCot[0];

        // Obtener detalles de piezas
        const sqlPiezas = `
            SELECT
                d.*,
                p.nombre AS pieza_nombre,
                m.nombre AS modulo_nombre,
                t.nombre AS tablero_nombre,
                t.color AS tablero_color,
                t.tipo AS tablero_tipo
            FROM detalle_piezas_cotizacion d
            LEFT JOIN piezas_modulo p ON d.id_pieza = p.id_pieza
            LEFT JOIN modulos m ON d.id_modulo = m.id_modulo
            LEFT JOIN tableros t ON d.id_tablero = t.id_tablero
            WHERE d.id_cotizacion = ?
        `;

        conexion.query(sqlPiezas, [id], (err, rowsPiezas) => {
            if (err) return res.status(500).json(err);

            // Obtener detalles de accesorios
            const sqlAccesorios = `
                SELECT
                    da.*,
                    a.nombre AS accesorio_nombre,
                    a.precio_unitario
                FROM detalle_accesorios_cotizacion da
                INNER JOIN accesorios a ON da.id_accesorio = a.id_accesorio
                WHERE da.id_cotizacion = ?
            `;

            conexion.query(sqlAccesorios, [id], (err, rowsAccesorios) => {
                if (err) return res.status(500).json(err);

                res.json({
                    cotizacion,
                    piezas: rowsPiezas,
                    accesorios: rowsAccesorios
                });
            });
        });
    });
});

module.exports = router;
