const Accesorio = require('../models/Accesorio');
const Proveedor = require('../models/Proveedor');
const registrarAuditoria = require('../routes/auditoria');
const db = require('../db');

exports.obtenerAccesorios = async (req, res) => {
    try {
        const accesorios = await Accesorio.findAll({
            include: [{
                model: Proveedor,
                as: 'proveedor',
                attributes: ['nombre']
            }],
            order: [['id_accesorio', 'DESC']]
        });

        const result = accesorios.map(a => {
            const aJson = a.toJSON();
            aJson.proveedor = aJson.proveedor ? aJson.proveedor.nombre : null;
            return aJson;
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.guardarAccesorio = async (req, res) => {
    const {
        nombre,
        categoria,
        material,
        tamano,
        color,
        precio_unitario,
        id_proveedor,
        id_usuario
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del accesorio es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!categoria) {
        return res.status(400).json({ mensaje: 'La categoría es obligatoria.' });
    }
    if (precio_unitario === undefined || isNaN(precio_unitario) || parseFloat(precio_unitario) < 0) {
        return res.status(400).json({ mensaje: 'El precio unitario debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }

    try {
        await Accesorio.create({
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            material: material ? material.trim() : null,
            tamano: tamano ? tamano.trim() : null,
            color: color ? color.trim() : null,
            precio_unitario: parseFloat(precio_unitario),
            id_proveedor
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Registró el accesorio: ${nombre}`);
        }
        res.json({ mensaje: 'Accesorio registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el accesorio en la base de datos.' });
    }
};

exports.actualizarAccesorio = async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        categoria,
        material,
        tamano,
        color,
        precio_unitario,
        id_proveedor,
        id_usuario,
        estado
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del accesorio es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!categoria) {
        return res.status(400).json({ mensaje: 'La categoría es obligatoria.' });
    }
    if (precio_unitario === undefined || isNaN(precio_unitario) || parseFloat(precio_unitario) < 0) {
        return res.status(400).json({ mensaje: 'El precio unitario debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }

    try {
        const accesorio = await Accesorio.findByPk(id);
        if (!accesorio) {
            return res.status(404).json({ mensaje: 'Accesorio no encontrado' });
        }

        await accesorio.update({
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            material: material ? material.trim() : null,
            tamano: tamano ? tamano.trim() : null,
            color: color ? color.trim() : null,
            precio_unitario: parseFloat(precio_unitario),
            id_proveedor,
            estado: estado !== undefined ? estado : true
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Actualizó el accesorio: ${nombre}`);
        }
        res.json({ mensaje: 'Accesorio actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el accesorio en la base de datos.' });
    }
};

exports.eliminarAccesorio = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;

    try {
        db.query(`SELECT COUNT(*) AS total FROM detalle_accesorios_cotizacion WHERE id_accesorio = ?`, [id], async (errCheck, resultsCheck) => {
            if (errCheck) {
                console.error(errCheck);
                return res.status(500).json({ mensaje: 'Error al verificar relaciones del accesorio' });
            }
            const total = resultsCheck[0].total;

            const accesorio = await Accesorio.findByPk(id);
            if (!accesorio) {
                return res.status(404).json({ mensaje: 'Accesorio no encontrado' });
            }

            const nombreAcc = accesorio.nombre;

            if (total > 0) {
                await accesorio.update({ estado: false });
                if (id_usuario) {
                    registrarAuditoria(id_usuario, `Desactivó el accesorio: ${nombreAcc} (eliminación lógica por dependencias)`);
                }
                return res.json({ mensaje: `El accesorio está asociado a ${total} detalle(s) de cotización, por lo que fue desactivado (eliminación lógica) para conservar la integridad.` });
            }

            await accesorio.destroy();
            if (id_usuario) {
                registrarAuditoria(id_usuario, `Eliminó el accesorio: ${nombreAcc}`);
            }
            res.json({ mensaje: 'Accesorio eliminado correctamente' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el accesorio de la base de datos.' });
    }
};
