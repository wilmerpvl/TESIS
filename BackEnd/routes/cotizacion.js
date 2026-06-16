const express = require('express');
const router = express.Router();

const conexion = require('../db');


// ======================================================
// TIPOS DE MUEBLE
// ======================================================

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


// ======================================================
// SECCIONES
// ======================================================

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


// ======================================================
// MODULOS POR TIPO Y SECCION
// ======================================================

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


// ======================================================
// PIEZAS POR MODULO
// ======================================================

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


// ======================================================
// TABLEROS PARA COTIZACION
// ======================================================

router.get('/tableros-cotizacion', (req, res) => {

    const sql = `
        SELECT 
            t.*,
            p.nombre AS proveedor
        FROM tableros t
        LEFT JOIN proveedores p
        ON t.id_proveedor = p.id_proveedor
        ORDER BY t.tipo ASC, t.color ASC
    `;

    conexion.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ======================================================
// ACCESORIOS PARA COTIZACION
// ======================================================

router.get('/accesorios-cotizacion', (req, res) => {

    const sql = `
        SELECT 
            a.*,
            p.nombre AS proveedor
        FROM accesorios a
        LEFT JOIN proveedores p
        ON a.id_proveedor = p.id_proveedor
        ORDER BY a.categoria ASC, a.nombre ASC
    `;

    conexion.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ======================================================
// CLIENTES PARA COTIZACION
// ======================================================

router.get('/clientes-cotizacion', (req, res) => {

    conexion.query(
        'SELECT * FROM clientes ORDER BY nombre ASC',
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );

});


// ======================================================
// MODULO COMPLETO
// ======================================================

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


// ======================================================
// GUARDAR COTIZACION
// ======================================================

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
        accesorios
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

            // ==========================================
            // GUARDAR DETALLES PIEZAS
            // ==========================================

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

            // ==========================================
            // GUARDAR ACCESORIOS
            // ==========================================

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

            res.json({
                message: 'Cotización guardada correctamente'
            });

        }
    );

});

module.exports = router;