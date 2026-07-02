const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Usuario.findOne({
            where: {
                email: email,
                estado: true
            }
        });

        if (!user) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign(
                { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol },
                process.env.JWT_SECRET || 'clave_secreta_de_desarrollo',
                { expiresIn: '8h' }
            );
            res.json({
                mensaje: 'Login correcto',
                token,
                usuario: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                }
            });
        } else {
            res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error("Error en authController.login:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
