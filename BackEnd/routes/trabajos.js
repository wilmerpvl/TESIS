const express = require('express');
const router = express.Router();
const registrarAuditoria = require("./auditoria");
const conexion = require('../db');
// COTIZACIONES DISPONIBLES (PENDIENTES)
router.get('/trabajos-disponibles', (req, res) => {
    const sql = `
        SELECT
            c.id_cotizacion,
            c.fecha,
            c.total_final,
            cl.nombre AS cliente,
            tm.nombre AS tipo_mueble
        FROM cotizaciones c
        INNER JOIN clientes cl
        ON c.id_cliente = cl.id_cliente
        INNER JOIN tipos_mueble tm
        ON c.id_tipo = tm.id_tipo
        WHERE c.estado = 'PENDIENTE'
        ORDER BY c.id_cotizacion DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// CREAR TRABAJO
router.post('/trabajos', (req, res) => {
    const {
        id_cotizacion,
        fecha_estimada,
        prioridad,
        id_usuario // Recibimos el id_usuario en req.body
    } = req.body;
    const sql = `
        INSERT INTO trabajos
        (
            id_cotizacion,
            fecha_inicio,
            fecha_estimada,
            prioridad
        )
        VALUES
        (
            ?,
            CURDATE(),
            ?,
            ?
        )
    `;
    conexion.query(
        sql,
        [
            id_cotizacion,
            fecha_estimada,
            prioridad
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            // Cambiar estado de la cotización a APROBADA
            conexion.query(
                `
                UPDATE cotizaciones
                SET estado='APROBADA'
                WHERE id_cotizacion=?
                `,
                [id_cotizacion]
            );
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    "Creó trabajo #" + result.insertId + " para cotización #" + id_cotizacion
                );
            }
            res.json({
                mensaje: 'Trabajo creado correctamente'
            });
        }
    );
});
// LISTAR TRABAJOS
router.get('/trabajos', (req, res) => {
    const sql = `
        SELECT
            t.*,
            c.total_final,
            cl.nombre AS cliente,
            tm.nombre AS tipo_mueble
        FROM trabajos t
        INNER JOIN cotizaciones c
        ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cl
        ON c.id_cliente = cl.id_cliente
        INNER JOIN tipos_mueble tm
        ON c.id_tipo = tm.id_tipo
        ORDER BY t.id_trabajo DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// FINALIZAR TRABAJO (Duplica lógica pero está en rutas separadas en su backend original)
router.put('/trabajos/finalizar/:id', (req, res) => {
    const id = req.params.id;
    const { id_usuario } = req.body; // Recibimos id_usuario en caso de llamarse desde esta ruta
    const sql = `
        UPDATE trabajos
        SET
            estado='COMPLETADO',
            fecha_fin=CURDATE()
        WHERE id_trabajo=?
    `;
    conexion.query(
        sql,
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    "Finalizó trabajo #" + id
                );
            }
            res.json({
                mensaje: 'Trabajo finalizado'
            });
        }
    );
});
// ASIGNAR EMPLEADO
router.post('/trabajos/asignar-empleado', (req, res) => {
    const {
        id_trabajo,
        id_empleado,
        id_usuario // Recibimos id_usuario para auditoría
    } = req.body;
    const sql = `
        INSERT INTO trabajo_empleado
        (
            id_trabajo,
            id_empleado
        )
        VALUES
        (
            ?,
            ?
        )
    `;
    conexion.query(
        sql,
        [
            id_trabajo,
            id_empleado
        ],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    `Asignó empleado ID #${id_empleado} al trabajo #${id_trabajo}`
                );
            }
            res.json({
                mensaje: 'Empleado asignado'
            });
        }
    );
});
module.exports = router;
