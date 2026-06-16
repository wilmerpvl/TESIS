const express = require('express');
const router = express.Router();
const db = require('../db');

// listar
router.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// crear
router.post('/usuarios', (req, res) => {
    const { nombre, email, password, rol } = req.body;

    db.query(
        'INSERT INTO usuarios(nombre,email,password,rol) VALUES(?,?,?,?)',
        [nombre, email, password, rol],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Usuario creado' });
        }
    );
});

// actualizar
router.put('/usuarios/:id', (req, res) => {
    const { nombre, email, rol } = req.body;
    const id = req.params.id;

    db.query(
        'UPDATE usuarios SET nombre=?, email=?, rol=? WHERE id_usuario=?',
        [nombre, email, rol, id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Usuario actualizado' });
        }
    );
});

// eliminar
router.delete('/usuarios/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        'DELETE FROM usuarios WHERE id_usuario=?',
        [id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: 'Usuario eliminado' });
        }
    );
});

module.exports = router;