const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');
const registrarAuditoria = require('../routes/auditoria');
const saltRounds = 10;

exports.obtenerPerfil = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id, {
            attributes: ['id_usuario', 'nombre', 'email', 'rol', 'estado']
        });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.actualizarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: "Ingrese un correo electrónico válido." });
    }

    try {
        const emailExists = await Usuario.findOne({
            where: {
                email: email.trim(),
                id_usuario: { [Op.ne]: id }
            }
        });
        if (emailExists) {
            return res.status(400).json({ mensaje: "El correo electrónico ya está registrado por otro usuario." });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        if (password && password.trim().length >= 4) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await usuario.update({
                nombre: nombre.trim(),
                email: email.trim(),
                password: hashedPassword
            });
            registrarAuditoria(id, "Actualizó su información de perfil y contraseña");
            res.json({ mensaje: "Perfil y contraseña actualizados correctamente" });
        } else {
            await usuario.update({
                nombre: nombre.trim(),
                email: email.trim()
            });
            registrarAuditoria(id, "Actualizó su información de perfil");
            res.json({ mensaje: "Perfil actualizado correctamente" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};
