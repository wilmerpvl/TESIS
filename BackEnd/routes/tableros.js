const express = require('express');
const router = express.Router();
const tablerosController = require('../controllers/tablerosController');

router.get('/tableros', tablerosController.obtenerTableros);
router.post('/tableros', tablerosController.guardarTablero);
router.put('/tableros/:id', tablerosController.actualizarTablero);
router.delete('/tableros/:id', tablerosController.eliminarTablero);

module.exports = router;
