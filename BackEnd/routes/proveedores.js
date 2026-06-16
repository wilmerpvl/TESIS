const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener
router.get('/proveedores', (req, res) => {
    db.query('SELECT * FROM proveedores', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Guardar
router.post('/proveedores', (req, res) => {
    const { nombre, telefono, direccion, correo } = req.body;

    db.query(
        'INSERT INTO proveedores(nombre, telefono, direccion, correo) VALUES(?,?,?,?)',
        [nombre, telefono, direccion, correo],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Proveedor guardado' });
        }
    );
});

// Editar
router.put('/proveedores/:id', (req, res) => {
    const { nombre } = req.body;
    const { id } = req.params;

    db.query(
        'UPDATE proveedores SET nombre=? WHERE id_proveedor=?',
        [nombre, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Proveedor actualizado' });
        }
    );
});

// Eliminar
router.delete('/proveedores/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM proveedores WHERE id_proveedor=?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Proveedor eliminado' });
        }
    );
});

module.exports = router;