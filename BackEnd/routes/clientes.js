const express = require('express');
const router = express.Router();
const db = require('../db');


// OBTENER CLIENTES
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


// CREAR CLIENTE
router.post('/clientes', (req, res) => {
    const { nombre, identificacion, telefono, correo, direccion } = req.body;

    const sql = `
        INSERT INTO clientes(nombre, identificacion, telefono, correo, direccion)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, identificacion, telefono, correo, direccion], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al guardar cliente' });
        }

        res.json({ mensaje: 'Cliente guardado correctamente' });
    });
});


// EDITAR CLIENTE
router.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    const sql = 'UPDATE clientes SET nombre = ? WHERE id_cliente = ?';

    db.query(sql, [nombre, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al actualizar cliente' });
        }

        res.json({ mensaje: 'Cliente actualizado correctamente' });
    });
});


// ELIMINAR CLIENTE
router.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM clientes WHERE id_cliente = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al eliminar cliente' });
        }

        res.json({ mensaje: 'Cliente eliminado correctamente' });
    });
});

module.exports = router;