const express = require('express');
const router = express.Router();
const tablerosController = require('../controllers/tablerosController');
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

router.get('/tableros', tablerosController.obtenerTableros);
router.post('/tableros', upload.single("imagen"), tablerosController.guardarTablero);
router.put('/tableros/:id', upload.single("imagen"), tablerosController.actualizarTablero);
router.delete('/tableros/:id', tablerosController.eliminarTablero);

module.exports = router;
