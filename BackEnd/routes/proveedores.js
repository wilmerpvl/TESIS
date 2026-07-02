const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/proveedores', proveedoresController.obtenerProveedores);
router.post('/proveedores', proveedoresController.guardarProveedor);
router.put('/proveedores/:id', proveedoresController.actualizarProveedor);
router.delete('/proveedores/:id', proveedoresController.eliminarProveedor);

module.exports = router;
