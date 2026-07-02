const express = require('express');
const router = express.Router();
const progresoController = require('../controllers/progresoController');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }
});
const upload = multer({ storage });

router.get('/trabajos-progreso', progresoController.obtenerTrabajosProgreso);
router.get('/trabajos-completados', progresoController.obtenerTrabajosCompletados);
router.get('/trabajo/:id', progresoController.obtenerDetalleTrabajo);
router.get('/avances/:idTrabajo', progresoController.obtenerAvances);
router.get('/evidencias/:idAvance', progresoController.obtenerEvidencias);
router.post('/registrar-avance', upload.single("imagen"), progresoController.registrarAvance);
router.post('/guardar-evidencia', progresoController.guardarEvidencia);
router.put('/finalizar-trabajo/:id', progresoController.finalizarTrabajo);

module.exports = router;
