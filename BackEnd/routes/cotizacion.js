const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

router.get('/tipos-mueble', cotizacionController.obtenerTiposMueble);
router.get('/secciones', cotizacionController.obtenerSecciones);
router.get('/modulos/:idTipo/:idSeccion', cotizacionController.obtenerModulos);
router.get('/piezas/:idModulo', cotizacionController.obtenerPiezas);
router.get('/tableros-cotizacion', cotizacionController.obtenerTablerosCotizacion);
router.get('/accesorios-cotizacion', cotizacionController.obtenerAccesoriosCotizacion);
router.get('/clientes-cotizacion', cotizacionController.obtenerClientesCotizacion);
router.get('/modulo-completo/:id', cotizacionController.obtenerModuloCompleto);
router.post('/guardar-cotizacion', cotizacionController.guardarCotizacion);
router.put('/actualizar-cotizacion/:id', cotizacionController.actualizarCotizacion);
router.delete('/cotizacion/:id', cotizacionController.eliminarCotizacion);
router.get("/cotizacion-detalle/:id", cotizacionController.obtenerCotizacionDetalle);
router.post("/enviar-cotizacion-correo/:id", cotizacionController.enviarCotizacionCorreo);

module.exports = router;
