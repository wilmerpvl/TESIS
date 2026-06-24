const express = require('express');
const router = express.Router();
const registrarAuditoria = require("./auditoria");
const conexion = require('../db');
// LISTAR ACCESORIOS
router.get('/accesorios', (req, res) => {
    const sql = `
        SELECT 
            a.*,
            p.nombre AS proveedor
        FROM accesorios a
        LEFT JOIN proveedores p
        ON a.id_proveedor = p.id_proveedor
        ORDER BY a.id_accesorio DESC
    `;
    conexion.query(sql, (err, result) => {
        if(err){
            return res.status(500).json(err);
        }
        res.json(result);
    });
});
// REGISTRAR ACCESORIO (Con validaciones de servidor y auditoría)
router.post('/accesorios', (req, res) => {
    const {
        nombre,
        categoria,
        material,
        tamano,
        color,
        precio_unitario,
        id_proveedor,
        id_usuario
    } = req.body;
    // Validaciones de Backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del accesorio es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!categoria) {
        return res.status(400).json({ mensaje: 'La categoría es obligatoria.' });
    }
    if (precio_unitario === undefined || isNaN(precio_unitario) || parseFloat(precio_unitario) < 0) {
        return res.status(400).json({ mensaje: 'El precio unitario debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }
    const sql = `
        INSERT INTO accesorios
        (
            nombre,
            categoria,
            material,
            tamano,
            color,
            precio_unitario,
            id_proveedor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    conexion.query(sql, [
        nombre.trim(),
        categoria.trim(),
        material ? material.trim() : null,
        tamano ? tamano.trim() : null,
        color ? color.trim() : null,
        parseFloat(precio_unitario),
        id_proveedor
    ], (err) => {
        if(err){
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al registrar el accesorio en la base de datos.' });
        }
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Registró el accesorio: ${nombre}`
            );
        }
        res.json({
            mensaje: 'Accesorio registrado correctamente'
        });
    });
});
// ACTUALIZAR ACCESORIO (Con validaciones de servidor y auditoría)
router.put('/accesorios/:id', (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        categoria,
        material,
        tamano,
        color,
        precio_unitario,
        id_proveedor,
        id_usuario,
        estado
    } = req.body;
    // Validaciones de Backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del accesorio es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!categoria) {
        return res.status(400).json({ mensaje: 'La categoría es obligatoria.' });
    }
    if (precio_unitario === undefined || isNaN(precio_unitario) || parseFloat(precio_unitario) < 0) {
        return res.status(400).json({ mensaje: 'El precio unitario debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }
    const sql = `
        UPDATE accesorios
        SET
            nombre = ?,
            categoria = ?,
            material = ?,
            tamano = ?,
            color = ?,
            precio_unitario = ?,
            id_proveedor = ?,
            estado = ?
        WHERE id_accesorio = ?
    `;
    conexion.query(sql, [
        nombre.trim(),
        categoria.trim(),
        material ? material.trim() : null,
        tamano ? tamano.trim() : null,
        color ? color.trim() : null,
        parseFloat(precio_unitario),
        id_proveedor,
        estado !== undefined ? estado : 1,
        id
    ], (err) => {
        if(err){
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al actualizar el accesorio en la base de datos.' });
        }
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Actualizó el accesorio: ${nombre}`
            );
        }
        res.json({
            mensaje: 'Accesorio actualizado correctamente'
        });
    });
});
// ELIMINAR ACCESORIO (Con verificación de dependencias para evitar errores de BD)
router.delete('/accesorios/:id', (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;
    // 1. Verificar si el accesorio está asociado a alguna cotización
    const sqlCheck = `SELECT COUNT(*) AS total FROM detalle_accesorios_cotizacion WHERE id_accesorio = ?`;
    conexion.query(sqlCheck, [id], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error(errCheck);
            return res.status(500).json({ mensaje: 'Error al verificar relaciones del accesorio' });
        }
        const total = resultsCheck[0].total;
        if (total > 0) {
            // Se le desactiva (eliminación lógica) por seguridad y dependencias
            conexion.query('SELECT nombre FROM accesorios WHERE id_accesorio = ?', [id], (errBuscar, rows) => {
                const nombreAcc = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
                conexion.query('UPDATE accesorios SET estado = 0 WHERE id_accesorio = ?', [id], (errLog) => {
                    if (errLog) return res.status(500).json(errLog);
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Desactivó el accesorio: ${nombreAcc} (eliminación lógica por dependencias)`
                        );
                    }
                    res.json({ mensaje: `El accesorio está asociado a ${total} detalle(s) de cotización, por lo que fue desactivado (eliminación lógica) para conservar la integridad.` });
                });
            });
            return;
        }
        // 2. Si no tiene relaciones, procedemos al borrado físico
        conexion.query('SELECT nombre FROM accesorios WHERE id_accesorio = ?', [id], (errBuscar, rows) => {
            const nombreAcc = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
            const sql = `
                DELETE FROM accesorios
                WHERE id_accesorio = ?
            `;
            conexion.query(sql, [id], (err) => {
                if(err){
                    console.error(err);
                    return res.status(500).json({ mensaje: 'Error al eliminar el accesorio de la base de datos.' });
                }
                // Registrar auditoría si id_usuario existe
                if (id_usuario) {
                    registrarAuditoria(
                        id_usuario,
                        `Eliminó el accesorio: ${nombreAcc}`
                    );
                }
                res.json({
                    mensaje: 'Accesorio eliminado correctamente'
                });
            });
        });
    });
});
module.exports = router;
