const Cliente = require('../models/Cliente');
const registrarAuditoria = require('../routes/auditoria');
const db = require('../db');

exports.obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener clientes' });
    }
};

exports.guardarCliente = async (req, res) => {
    const { nombre, identificacion, telefono, correo, direccion, id_usuario } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!identificacion || (identificacion.length !== 10 && identificacion.length !== 13)) {
        return res.status(400).json({ mensaje: 'La identificación es obligatoria y debe ser Cédula (10 dígitos) o RUC (13 dígitos).' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }

    try {
        const nuevoCliente = await Cliente.create({
            nombre,
            identificacion,
            telefono,
            correo,
            direccion
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Registró al cliente: ${nombre}`);
        }
        res.json({ mensaje: 'Cliente guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al guardar cliente' });
    }
};

exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, identificacion, telefono, correo, direccion, id_usuario, estado } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!identificacion || (identificacion.length !== 10 && identificacion.length !== 13)) {
        return res.status(400).json({ mensaje: 'La identificación es obligatoria y debe ser Cédula (10 dígitos) o RUC (13 dígitos).' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }

    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        await cliente.update({
            nombre,
            identificacion,
            telefono,
            correo,
            direccion,
            estado: estado !== undefined ? estado : true
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Editó al cliente: ${nombre}`);
        }
        res.json({ mensaje: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar cliente' });
    }
};

exports.eliminarCliente = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;

    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        const nombreCliente = cliente.nombre;
        await cliente.update({ estado: false });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Desactivó al cliente: ${nombreCliente} (eliminación lógica)`);
        }
        res.json({ mensaje: 'Cliente desactivado (eliminación lógica) correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al desactivar cliente' });
    }
};
