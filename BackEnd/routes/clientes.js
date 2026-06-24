const express = require('express');
const router = express.Router();
const db = require('../db');
// Importar la función de auditoría
const registrarAuditoria = require("./auditoria");
// OBTENER CLIENTES (LISTAR)
router.get('/clientes', (req, res) => {
    const sql = 'SELECT * FROM clientes';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener clientes' });
        }
        res.json(result);
    });
});
// CREAR CLIENTE (Con validaciones de lado del servidor)
router.post('/clientes', (req, res) => {
    const { nombre, identificacion, telefono, correo, direccion, id_usuario } = req.body;
    // Validaciones básicas del servidor
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!identificacion || (identificacion.length !== 10 && identificacion.length !== 13)) {
        return res.status(400).json({ mensaje: 'La identificación es obligatoria y debe ser Cédula (10 dígitos) o RUC (13 dígitos).' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }
    const sql = `
        INSERT INTO clientes(nombre, identificacion, telefono, correo, direccion)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [nombre, identificacion, telefono, correo, direccion], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al guardar cliente' });
        }
        
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Registró al cliente: ${nombre}`
            );
        }
        res.json({ mensaje: 'Cliente guardado correctamente' });
    });
});
// EDITAR CLIENTE (Con validaciones, estado y auditoría)
router.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, identificacion, telefono, correo, direccion, id_usuario, estado } = req.body;
    // Validaciones básicas del servidor
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!identificacion || (identificacion.length !== 10 && identificacion.length !== 13)) {
        return res.status(400).json({ mensaje: 'La identificación es obligatoria y debe ser Cédula (10 dígitos) o RUC (13 dígitos).' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }
    const sql = `
        UPDATE clientes 
        SET nombre = ?, identificacion = ?, telefono = ?, correo = ?, direccion = ?, estado = ? 
        WHERE id_cliente = ?
    `;
    db.query(sql, [nombre, identificacion, telefono, correo, direccion, estado !== undefined ? estado : 1, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al actualizar cliente' });
        }
        // Registrar auditoría si id_usuario existe
        if (id_usuario) {
            registrarAuditoria(
                id_usuario,
                `Editó al cliente: ${nombre}`
            );
        }
        res.json({ mensaje: 'Cliente actualizado correctamente' });
    });
});
// ELIMINAR CLIENTE (Con verificación de relaciones para prevenir borrados incorrectos)
router.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;
    // 1. Verificar si el cliente tiene cotizaciones asociadas
    const sqlCheck = 'SELECT COUNT(*) AS total FROM cotizaciones WHERE id_cliente = ?';
    db.query(sqlCheck, [id], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error(errCheck);
            return res.status(500).json({ mensaje: 'Error al verificar relaciones del cliente' });
        }
        const totalCotizaciones = resultsCheck[0].total;
        if (totalCotizaciones > 0) {
            // Se le inactiva (eliminación lógica) para conservar registros de auditoría y facturas
            db.query('SELECT nombre FROM clientes WHERE id_cliente = ?', [id], (errBuscar, rows) => {
                const nombreCliente = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
                db.query('UPDATE clientes SET estado = 0 WHERE id_cliente = ?', [id], (errLog) => {
                    if (errLog) return res.status(500).json(errLog);
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Desactivó al cliente: ${nombreCliente} (eliminación lógica por dependencias)`
                        );
                    }
                    res.json({ mensaje: 'El cliente tiene cotizaciones asociadas, por lo que fue desactivado (eliminación lógica) para conservar la integridad de los datos.' });
                });
            });
            return;
        }
        // 2. Si no tiene cotizaciones, procedemos a borrarlo físicamente
        const sqlBuscar = 'SELECT nombre FROM clientes WHERE id_cliente = ?';
        db.query(sqlBuscar, [id], (errBuscar, rows) => {
            const nombreCliente = (rows && rows[0]) ? rows[0].nombre : `con ID ${id}`;
            const sqlDelete = 'DELETE FROM clientes WHERE id_cliente = ?';
            
            db.query(sqlDelete, [id], (errDelete, result) => {
                if (errDelete) {
                    console.error(errDelete);
                    return res.status(500).json({ mensaje: 'Error al eliminar cliente' });
                }
                
                // Registrar auditoría si id_usuario existe
                if (id_usuario) {
                    registrarAuditoria(
                        id_usuario,
                        `Eliminó al cliente: ${nombreCliente}`
                    );
                }
                res.json({ mensaje: 'Cliente eliminado correctamente' });
            });
        });
    });
});
module.exports = router;
