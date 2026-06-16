const express = require('express');
const router = express.Router();
const db = require('../db');


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


// CREAR TABLERO

router.post('/tableros', (req, res) => {

    const {
        nombre,
        tipo,
        precio_tablon,
        ancho,
        alto,
        costo_corte,
        color,
        id_proveedor
    } = req.body;

    const sql = `
        INSERT INTO tableros
        (
            nombre,
            tipo,
            precio_tablon,
            ancho,
            alto,
            costo_corte,
            color,
            id_proveedor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        nombre,
        tipo,
        precio_tablon,
        ancho,
        alto,
        costo_corte,
        color,
        id_proveedor
    ], (err, result) => {

        if (err) return res.status(500).json(err);

        res.json({
            message: 'Tablero registrado'
        });

    });

});


// ACTUALIZAR TABLERO

router.put('/tableros/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        tipo,
        precio_tablon,
        ancho,
        alto,
        costo_corte,
        color,
        id_proveedor
    } = req.body;

    const sql = `
        UPDATE tableros
        SET
            nombre = ?,
            tipo = ?,
            precio_tablon = ?,
            ancho = ?,
            alto = ?,
            costo_corte = ?,
            color = ?,
            id_proveedor = ?
        WHERE id_tablero = ?
    `;

    db.query(sql, [
        nombre,
        tipo,
        precio_tablon,
        ancho,
        alto,
        costo_corte,
        color,
        id_proveedor,
        id
    ], (err, result) => {

        if (err) return res.status(500).json(err);

        res.json({
            message: 'Tablero actualizado'
        });

    });

});


// ELIMINAR TABLERO

router.delete('/tableros/:id', (req, res) => {

    const { id } = req.params;

    db.query(
        'DELETE FROM tableros WHERE id_tablero = ?',
        [id],
        (err, result) => {

            if (err) return res.status(500).json(err);

            res.json({
                message: 'Tablero eliminado'
            });

        }
    );

});

module.exports = router;