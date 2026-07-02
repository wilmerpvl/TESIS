const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');
const registrarAuditoria = require('../routes/auditoria');
const db = require('../db');
const saltRounds = 10;

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['id_usuario', 'nombre', 'email', 'rol', 'estado'],
            order: [['id_usuario', 'DESC']]
        });
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.guardarUsuario = async (req, res) => {
    const { nombre, email, password, rol, id_usuario } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre completo es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El correo electrónico no es válido.' });
    }
    if (!password || password.trim().length < 4) {
        return res.status(400).json({ mensaje: 'La contraseña es obligatoria y debe tener al menos 4 caracteres.' });
    }
    if (!rol || !['ADMIN', 'DUENO', 'EMPLEADO'].includes(rol)) {
        return res.status(400).json({ mensaje: 'El rol seleccionado no es válido (Debe ser ADMIN, DUENO o EMPLEADO).' });
    }

    try {
        const userExists = await Usuario.findOne({ where: { email: email.trim() } });
        if (userExists) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado por otro usuario.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await Usuario.create({
            nombre: nombre.trim(),
            email: email.trim(),
            password: hashedPassword,
            rol
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Registró al usuario: ${nombre} (${rol})`);
        }
        res.json({ mensaje: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.actualizarUsuario = async (req, res) => {
    const { nombre, email, password, rol, id_usuario, estado } = req.body;
    const { id } = req.params;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre completo es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El correo electrónico no es válido.' });
    }
    if (!rol || !['ADMIN', 'DUENO', 'EMPLEADO'].includes(rol)) {
        return res.status(400).json({ mensaje: 'El rol seleccionado no es válido.' });
    }

    try {
        const userExists = await Usuario.findOne({
            where: {
                email: email.trim(),
                id_usuario: { [Op.ne]: id }
            }
        });
        if (userExists) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado por otro usuario.' });
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const estadoVal = estado !== undefined ? estado : true;

        if (password && password.trim().length >= 4) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await usuario.update({
                nombre: nombre.trim(),
                email: email.trim(),
                password: hashedPassword,
                rol,
                estado: estadoVal
            });
            if (id_usuario) {
                registrarAuditoria(id_usuario, `Actualizó al usuario (con cambio de clave): ${nombre} (${rol})`);
            }
        } else {
            await usuario.update({
                nombre: nombre.trim(),
                email: email.trim(),
                rol,
                estado: estadoVal
            });
            if (id_usuario) {
                registrarAuditoria(id_usuario, `Actualizó al usuario: ${nombre} (${rol})`);
            }
        }
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.eliminarUsuario = async (req, res) => {
    const id = req.params.id;
    const id_usuario = req.query.id_usuario;

    if (parseInt(id) === parseInt(id_usuario)) {
        return res.status(400).json({ mensaje: 'No puedes eliminar o desactivar tu propio usuario desde este módulo.' });
    }

    try {
        const sqlCheck = `
            SELECT 
                (SELECT COUNT(*) FROM auditoria WHERE id_usuario = ?) AS totalAuditoria,
                (SELECT COUNT(*) FROM trabajo_empleado WHERE id_empleado = ?) AS totalTrabajos
        `;
        db.query(sqlCheck, [id, id], async (errCheck, resultsCheck) => {
            if (errCheck) {
                console.error(errCheck);
                return res.status(500).json({ mensaje: 'Error al verificar relaciones del usuario' });
            }
            const totalAuditoria = resultsCheck[0].totalAuditoria;
            const totalTrabajos = resultsCheck[0].totalTrabajos;

            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            const nombreUsr = `${usuario.nombre} (${usuario.rol})`;

            if (totalAuditoria > 0 || totalTrabajos > 0) {
                let detalles = [];
                if (totalAuditoria > 0) detalles.push(`${totalAuditoria} registro(s) de auditoría`);
                if (totalTrabajos > 0) detalles.push(`${totalTrabajos} trabajo(s) asignado(s)`);

                await usuario.update({ estado: false });
                if (id_usuario) {
                    registrarAuditoria(id_usuario, `Desactivó al usuario: ${nombreUsr} (eliminación lógica por dependencias)`);
                }
                return res.json({ mensaje: `El usuario está asociado a ${detalles.join(' y ')}, por lo que fue desactivado (eliminación lógica) para conservar el historial.` });
            }

            await usuario.destroy();
            if (id_usuario) {
                registrarAuditoria(id_usuario, `Eliminó al usuario: ${nombreUsr}`);
            }
            res.json({ mensaje: 'Usuario eliminado correctamente' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};
