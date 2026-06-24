const express = require('express');
const router = express.Router();
const db = require('../db');
const registrarAuditoria = require("./auditoria");
// OBTENER TABLEROS
router.get('/tableros', (req, res) => {
    const sql = `
        SELECT 
            t.*,
            p.nombre AS proveedor
        FROM tableros t
        LEFT JOIN proveedores p
        ON t.id_proveedor = p.id_proveedor
        ORDER BY t.id_tablero DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
// CREAR TABLERO (Con validaciones de servidor y auditoría)
router.post('/tableros', (req, res) => {
    const {
        nombre,
        tipo,
        color,
        textura,
        ancho,
        alto,
        espesor,
        precio_tablero,
        costo_corte,
        id_proveedor,
        id_usuario
    } = req.body;
    // Validaciones de Backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del tablero es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!tipo || !['MELAMINA', 'MDF', 'TRIPLEX'].includes(tipo)) {
        return res.status(400).json({ mensaje: 'El tipo de tablero no es válido. Debe ser MELAMINA, MDF o TRIPLEX.' });
    }
    if (ancho === undefined || isNaN(ancho) || parseFloat(ancho) <= 0) {
        return res.status(400).json({ mensaje: 'El ancho debe ser un número positivo mayor a 0.' });
    }
    if (alto === undefined || isNaN(alto) || parseFloat(alto) <= 0) {
        return res.status(400).json({ mensaje: 'El alto debe ser un número positivo mayor a 0.' });
    }
    if (espesor === undefined || isNaN(espesor) || parseFloat(espesor) <= 0) {
        return res.status(400).json({ mensaje: 'El espesor debe ser un número positivo mayor a 0.' });
    }
    if (precio_tablero === undefined || isNaN(precio_tablero) || parseFloat(precio_tablero) < 0) {
        return res.status(400).json({ mensaje: 'El precio del tablero debe ser un número igual o mayor a 0.' });
    }
    if (costo_corte === undefined || isNaN(costo_corte) || parseFloat(costo_corte) < 0) {
        return res.status(400).json({ mensaje: 'El costo de corte debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }
    const sql = `
        INSERT INTO tableros
        (
            nombre,
            tipo,
            color,
            textura,
            ancho,
            alto,
            espesor,
            precio_tablero,
            costo_corte,
            id_proveedor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
        nombre.trim(),
        tipo,
        color ? color.trim() : null,
        textura ? textura.trim() : null,
        parseFloat(ancho),
        parseFloat(alto),
        parseFloat(espesor),
        parseFloat(precio_tablero),
        parseFloat(costo_corte),
        id_proveedor
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al registrar el tablero en la base de datos.' });
        }
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Registró el tablero: ${nombre}`
            );
        }
        res.json({
            mensaje: 'Tablero registrado correctamente'
        });
    });
});
// ACTUALIZAR TABLERO (Con validaciones de servidor y auditoría)
router.put('/tableros/:id', (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        tipo,
        color,
        textura,
        ancho,
        alto,
        espesor,
        precio_tablero,
        costo_corte,
        id_proveedor,
        id_usuario,
        estado
    } = req.body;
    // Validaciones de Backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del tablero es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!tipo || !['MELAMINA', 'MDF', 'TRIPLEX'].includes(tipo)) {
        return res.status(400).json({ mensaje: 'El tipo de tablero no es válido. Debe ser MELAMINA, MDF o TRIPLEX.' });
    }
    if (ancho === undefined || isNaN(ancho) || parseFloat(ancho) <= 0) {
        return res.status(400).json({ mensaje: 'El ancho debe ser un número positivo mayor a 0.' });
    }
    if (alto === undefined || isNaN(alto) || parseFloat(alto) <= 0) {
        return res.status(400).json({ mensaje: 'El alto debe ser un número positivo mayor a 0.' });
    }
    if (espesor === undefined || isNaN(espesor) || parseFloat(espesor) <= 0) {
        return res.status(400).json({ mensaje: 'El espesor debe ser un número positivo mayor a 0.' });
    }
    if (precio_tablero === undefined || isNaN(precio_tablero) || parseFloat(precio_tablero) < 0) {
        return res.status(400).json({ mensaje: 'El precio del tablero debe ser un número igual o mayor a 0.' });
    }
    if (costo_corte === undefined || isNaN(costo_corte) || parseFloat(costo_corte) < 0) {
        return res.status(400).json({ mensaje: 'El costo de corte debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }
    const sql = `
        UPDATE tableros
        SET
            nombre = ?,
            tipo = ?,
            color = ?,
            textura = ?,
            ancho = ?,
            alto = ?,
            espesor = ?,
            precio_tablero = ?,
            costo_corte = ?,
            id_proveedor = ?,
            estado = ?
        WHERE id_tablero = ?
    `;
    db.query(sql, [
        nombre.trim(),
        tipo,
        color ? color.trim() : null,
        textura ? textura.trim() : null,
        parseFloat(ancho),
        parseFloat(alto),
        parseFloat(espesor),
        parseFloat(precio_tablero),
        parseFloat(costo_corte),
        id_proveedor,
        estado !== undefined ? estado : 1,
        id
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al actualizar el tablero en la base de datos.' });
        }
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Actualizó el tablero: ${nombre}`
            );
        }
        res.json({
            mensaje: 'Tablero actualizado correctamente'
        });
    });
});
// ELIMINAR TABLERO (Con verificación de relaciones para prevenir errores de BD)
router.delete('/tableros/:id', (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;
    // 1. Verificar si el tablero está asociado a alguna cotización
    const sqlCheck = `SELECT COUNT(*) AS total FROM detalle_piezas_cotizacion WHERE id_tablero = ?`;
    db.query(sqlCheck, [id], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error(errCheck);
            return res.status(500).json({ mensaje: 'Error al verificar relaciones del tablero' });
        }
        const total = resultsCheck[0].total;
        if (total > 0) {
            // Se le desactiva (eliminación lógica) por seguridad y dependencias
            db.query('SELECT nombre FROM tableros WHERE id_tablero = ?', [id], (errBuscar, rows) => {
                const nombreTab = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
                db.query('UPDATE tableros SET estado = 0 WHERE id_tablero = ?', [id], (errLog) => {
                    if (errLog) return res.status(500).json(errLog);
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Desactivó el tablero: ${nombreTab} (eliminación lógica por dependencias)`
                        );
                    }
                    res.json({ mensaje: `El tablero está asociado a ${total} detalle(s) de cotización, por lo que fue desactivado (eliminación lógica) para conservar la integridad.` });
                });
            });
            return;
        }
        // 2. Si no tiene relaciones, procedemos al borrado físico
        db.query('SELECT nombre FROM tableros WHERE id_tablero = ?', [id], (errBuscar, rows) => {
            const nombreTab = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
            db.query(
                'DELETE FROM tableros WHERE id_tablero = ?',
                [id],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ mensaje: 'Error al eliminar el tablero de la base de datos.' });
                    }
                    // Registrar auditoría si id_usuario existe
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Eliminó el tablero: ${nombreTab}`
                        );
                    }
                    res.json({
                        mensaje: 'Tablero eliminado correctamente'
                    });
                }
            );
        });
    });
});
module.exports = router;
