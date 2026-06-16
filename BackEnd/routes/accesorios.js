const express = require('express');
const router = express.Router();

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
    `;

    conexion.query(sql, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// REGISTRAR ACCESORIO

router.post('/accesorios', (req, res) => {

    const {
        nombre,
        tipo,
        material,
        tamano,
        precio_unitario,
        id_proveedor
    } = req.body;

    const sql = `
        INSERT INTO accesorios
        (
            nombre,
            tipo,
            material,
            tamano,
            precio_unitario,
            id_proveedor
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexion.query(sql, [

        nombre,
        tipo,
        material,
        tamano,
        precio_unitario,
        id_proveedor

    ], (err) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json({
            mensaje: 'Accesorio registrado'
        });

    });

});


// ELIMINAR

router.delete('/accesorios/:id', (req, res) => {

    const sql = `
        DELETE FROM accesorios
        WHERE id_accesorio = ?
    `;

    conexion.query(sql, [req.params.id], (err) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json({
            mensaje: 'Accesorio eliminado'
        });

    });

});


// ACTUALIZAR

router.put('/accesorios/:id', (req, res) => {

    const {
        nombre,
        tipo,
        material,
        tamano,
        precio_unitario,
        id_proveedor
    } = req.body;

    const sql = `
        UPDATE accesorios
        SET
        nombre = ?,
        tipo = ?,
        material = ?,
        tamano = ?,
        precio_unitario = ?,
        id_proveedor = ?
        WHERE id_accesorio = ?
    `;

    conexion.query(sql, [

        nombre,
        tipo,
        material,
        tamano,
        precio_unitario,
        id_proveedor,
        req.params.id

    ], (err) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json({
            mensaje: 'Accesorio actualizado'
        });

    });

});

module.exports = router;