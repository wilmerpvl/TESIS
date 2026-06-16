const express = require('express');
const router = express.Router();
const db = require('../db');

// LOGIN SIMPLE (SIN ENCRIPTACIÓN)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (results.length > 0) {
      const user = results[0];

      res.json({
        mensaje: 'Login correcto',
        usuario: {
          id: user.id_usuario,
          nombre: user.nombre,
          rol: user.rol
        }
      });
    } else {
      res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }
  });
});

module.exports = router;