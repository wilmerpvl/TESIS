const express = require('express');
const router = express.Router();
const trabajosController = require('../controllers/trabajosController');

router.get('/trabajos-disponibles', trabajosController.obtenerTrabajosDisponibles);
router.post('/trabajos', trabajosController.crearTrabajo);
router.get('/trabajos', trabajosController.obtenerTrabajos);
router.put('/trabajos/finalizar/:id', trabajosController.finalizarTrabajo);
router.post('/trabajos/asignar-empleado', trabajosController.asignarEmpleado);

module.exports = router;
