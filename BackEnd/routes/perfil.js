const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController");

router.get("/perfil/:id", perfilController.obtenerPerfil);
router.put("/perfil/:id", perfilController.actualizarPerfil);

module.exports = router;