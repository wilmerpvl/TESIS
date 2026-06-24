const express = require('express');
const router = express.Router();
const db = require('../db');
const registrarAuditoria = require("./auditoria");
// OBTENER PROVEEDORES
router.get('/proveedores', (req, res) => {
    db.query('SELECT * FROM proveedores', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
// CREAR PROVEEDOR (Con validaciones de servidor)
router.post('/proveedores', (req, res) => {
    const { nombre, telefono, direccion, correo, id_usuario } = req.body;
    // Validaciones de backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }
    db.query(
        'INSERT INTO proveedores(nombre, telefono, direccion, correo) VALUES(?,?,?,?)',
        [nombre, telefono, direccion, correo],
        (err, result) => {
            if (err) return res.status(500).json(err);
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    `Registró al proveedor: ${nombre}`
                );
            }
            res.json({ mensaje: 'Proveedor guardado correctamente' });
        }
    );
});
// EDITAR PROVEEDOR (Con validaciones, estado y auditoría)
router.put('/proveedores/:id', (req, res) => {
    const { nombre, telefono, direccion, correo, id_usuario, estado } = req.body;
    const { id } = req.params;
    // Validaciones de backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }
    db.query(
        'UPDATE proveedores SET nombre=?, telefono=?, direccion=?, correo=?, estado=? WHERE id_proveedor=?',
        [nombre, telefono, direccion, correo, estado !== undefined ? estado : 1, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            // Registrar auditoría si id_usuario existe
            if (id_usuario) {
                registrarAuditoria(
                    id_usuario,
                    `Editó al proveedor: ${nombre}`
                );
            }
            res.json({ mensaje: 'Proveedor actualizado correctamente' });
        }
    );
});
// ELIMINAR PROVEEDOR (Con verificación de relaciones para prevenir borrados incorrectos)
router.delete('/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;
    // 1. Verificar si el proveedor está asociado a tableros o accesorios
    const sqlCheck = `
        SELECT 
            (SELECT COUNT(*) FROM tableros WHERE id_proveedor = ?) AS totalTableros,
            (SELECT COUNT(*) FROM accesorios WHERE id_proveedor = ?) AS totalAccesorios
    `;
    db.query(sqlCheck, [id, id], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error(errCheck);
            return res.status(500).json({ mensaje: 'Error al verificar relaciones del proveedor' });
        }
        const totalTableros = resultsCheck[0].totalTableros;
        const totalAccesorios = resultsCheck[0].totalAccesorios;
        if (totalTableros > 0 || totalAccesorios > 0) {
            let detalles = [];
            if (totalTableros > 0) detalles.push(`${totalTableros} tablero(s)`);
            if (totalAccesorios > 0) detalles.push(`${totalAccesorios} accesorio(s)`);
            
            // Se le desactiva (eliminación lógica) por seguridad y dependencias
            db.query('SELECT nombre FROM proveedores WHERE id_proveedor = ?', [id], (errBuscar, rows) => {
                const nombreProv = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
                db.query('UPDATE proveedores SET estado = 0 WHERE id_proveedor = ?', [id], (errLog) => {
                    if (errLog) return res.status(500).json(errLog);
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Desactivó al proveedor: ${nombreProv} (eliminación lógica por dependencias)`
                        );
                    }
                    res.json({ mensaje: `El proveedor está asociado a ${detalles.join(' y ')}, por lo que fue desactivado (eliminación lógica) para conservar la integridad.` });
                });
            });
            return;
        }
        // 2. Si no tiene relaciones, procedemos a borrarlo físicamente
        db.query('SELECT nombre FROM proveedores WHERE id_proveedor = ?', [id], (errBuscar, rows) => {
            const nombreProv = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
            db.query(
                'DELETE FROM proveedores WHERE id_proveedor=?',
                [id],
                (err, result) => {
                    if (err) return res.status(500).json(err);
                    // Registrar auditoría si id_usuario existe
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Eliminó al proveedor: ${nombreProv}`
                        );
                    }
                    res.json({ mensaje: 'Proveedor eliminado correctamente' });
                }
            );
        });
    });
});
module.exports = router;
