const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// LOGIN CON ENCRIPTACIÓN BCRYPT Y JWT
router.post('/login', authController.login);

module.exports = router;