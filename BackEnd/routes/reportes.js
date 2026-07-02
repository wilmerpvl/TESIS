const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportesController");

router.get("/reportes/resumen", reportesController.obtenerResumen);
router.get("/reportes/cotizaciones", reportesController.obtenerCotizaciones);
router.get("/reportes/materiales", reportesController.obtenerMateriales);
router.get("/reportes/accesorios", reportesController.obtenerAccesorios);
router.get("/reportes/trabajos", reportesController.obtenerTrabajos);

module.exports = router;
