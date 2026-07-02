const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/clientes', clientesController.obtenerClientes);
router.post('/clientes', clientesController.guardarCliente);
router.put('/clientes/:id', clientesController.actualizarCliente);
router.delete('/clientes/:id', clientesController.eliminarCliente);

module.exports = router;
