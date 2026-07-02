const express = require('express');
const router = express.Router();
const accesoriosController = require('../controllers/accesoriosController');

router.get('/accesorios', accesoriosController.obtenerAccesorios);
router.post('/accesorios', accesoriosController.guardarAccesorio);
router.put('/accesorios/:id', accesoriosController.actualizarAccesorio);
router.delete('/accesorios/:id', accesoriosController.eliminarAccesorio);

module.exports = router;
