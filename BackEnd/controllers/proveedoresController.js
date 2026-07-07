const Proveedor = require('../models/Proveedor');
const registrarAuditoria = require('../routes/auditoria');
const db = require('../db');

exports.obtenerProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll();
        res.json(proveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.guardarProveedor = async (req, res) => {
    const { nombre, telefono, direccion, correo, id_usuario } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }

    try {
        await Proveedor.create({
            nombre,
            telefono,
            direccion,
            correo
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Registró al proveedor: ${nombre}`);
        }
        res.json({ mensaje: 'Proveedor guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.actualizarProveedor = async (req, res) => {
    const { nombre, telefono, direccion, correo, id_usuario, estado } = req.body;
    const { id } = req.params;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del proveedor es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!telefono) {
        return res.status(400).json({ mensaje: 'El teléfono es obligatorio.' });
    }
    if (!direccion) {
        return res.status(400).json({ mensaje: 'La dirección es obligatoria.' });
    }

    try {
        const proveedor = await Proveedor.findByPk(id);
        if (!proveedor) {
            return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
        }

        await proveedor.update({
            nombre,
            telefono,
            direccion,
            correo,
            estado: estado !== undefined ? estado : true
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Editó al proveedor: ${nombre}`);
        }
        res.json({ mensaje: 'Proveedor actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.eliminarProveedor = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;

    try {
        const proveedor = await Proveedor.findByPk(id);
        if (!proveedor) {
            return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
        }

        const nombreProv = proveedor.nombre;
        await proveedor.update({ estado: false });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Desactivó al proveedor: ${nombreProv} (eliminación lógica)`);
        }
        res.json({ mensaje: 'Proveedor desactivado (eliminación lógica) correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al desactivar proveedor' });
    }
};
