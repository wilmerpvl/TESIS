const express = require("express");
const router = express.Router();
const auditoriaController = require("../controllers/auditoriaController");

router.get("/auditoria", auditoriaController.obtenerAuditoria);

module.exports = router;