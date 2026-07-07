const Tablero = require('../models/Tablero');
const Proveedor = require('../models/Proveedor');
const registrarAuditoria = require('../routes/auditoria');
const db = require('../db');

exports.obtenerTableros = async (req, res) => {
    try {
        const tableros = await Tablero.findAll({
            include: [{
                model: Proveedor,
                as: 'proveedor',
                attributes: ['nombre']
            }],
            order: [['id_tablero', 'DESC']]
        });
        
        const result = tableros.map(t => {
            const tJson = t.toJSON();
            tJson.proveedor = tJson.proveedor ? tJson.proveedor.nombre : null;
            return tJson;
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

exports.guardarTablero = async (req, res) => {
    const {
        nombre,
        tipo,
        color,
        textura,
        ancho,
        alto,
        espesor,
        precio_tablero,
        costo_corte,
        id_proveedor,
        id_usuario
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del tablero es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!tipo || !['MELAMINA', 'MDF', 'TRIPLEX'].includes(tipo)) {
        return res.status(400).json({ mensaje: 'El tipo de tablero no es válido. Debe ser MELAMINA, MDF o TRIPLEX.' });
    }
    if (ancho === undefined || isNaN(ancho) || parseFloat(ancho) <= 0) {
        return res.status(400).json({ mensaje: 'El ancho debe ser un número positivo mayor a 0.' });
    }
    if (alto === undefined || isNaN(alto) || parseFloat(alto) <= 0) {
        return res.status(400).json({ mensaje: 'El alto debe ser un número positivo mayor a 0.' });
    }
    if (espesor === undefined || isNaN(espesor) || parseFloat(espesor) <= 0) {
        return res.status(400).json({ mensaje: 'El espesor debe ser un número positivo mayor a 0.' });
    }
    if (precio_tablero === undefined || isNaN(precio_tablero) || parseFloat(precio_tablero) < 0) {
        return res.status(400).json({ mensaje: 'El precio del tablero debe ser un número igual o mayor a 0.' });
    }
    if (costo_corte === undefined || isNaN(costo_corte) || parseFloat(costo_corte) < 0) {
        return res.status(400).json({ mensaje: 'El costo de corte debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }

    try {
        await Tablero.create({
            nombre: nombre.trim(),
            tipo,
            color: color ? color.trim() : null,
            textura: textura ? textura.trim() : null,
            ancho: parseFloat(ancho),
            alto: parseFloat(alto),
            espesor: parseFloat(espesor),
            precio_tablero: parseFloat(precio_tablero),
            costo_corte: parseFloat(costo_corte),
            imagen: req.file ? req.file.filename : null,
            id_proveedor: parseInt(id_proveedor) || null
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Registró el tablero: ${nombre}`);
        }
        res.json({ mensaje: 'Tablero registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el tablero en la base de datos.' });
    }
};

exports.actualizarTablero = async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        tipo,
        color,
        textura,
        ancho,
        alto,
        espesor,
        precio_tablero,
        costo_corte,
        id_proveedor,
        id_usuario,
        estado
    } = req.body;

    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre del tablero es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!tipo || !['MELAMINA', 'MDF', 'TRIPLEX'].includes(tipo)) {
        return res.status(400).json({ mensaje: 'El tipo de tablero no es válido. Debe ser MELAMINA, MDF o TRIPLEX.' });
    }
    if (ancho === undefined || isNaN(ancho) || parseFloat(ancho) <= 0) {
        return res.status(400).json({ mensaje: 'El ancho debe ser un número positivo mayor a 0.' });
    }
    if (alto === undefined || isNaN(alto) || parseFloat(alto) <= 0) {
        return res.status(400).json({ mensaje: 'El alto debe ser un número positivo mayor a 0.' });
    }
    if (espesor === undefined || isNaN(espesor) || parseFloat(espesor) <= 0) {
        return res.status(400).json({ mensaje: 'El espesor debe ser un número positivo mayor a 0.' });
    }
    if (precio_tablero === undefined || isNaN(precio_tablero) || parseFloat(precio_tablero) < 0) {
        return res.status(400).json({ mensaje: 'El precio del tablero debe ser un número igual o mayor a 0.' });
    }
    if (costo_corte === undefined || isNaN(costo_corte) || parseFloat(costo_corte) < 0) {
        return res.status(400).json({ mensaje: 'El costo de corte debe ser un número igual o mayor a 0.' });
    }
    if (!id_proveedor) {
        return res.status(400).json({ mensaje: 'Debe seleccionar un proveedor válido.' });
    }

    try {
        const tablero = await Tablero.findByPk(id);
        if (!tablero) {
            return res.status(404).json({ mensaje: 'Tablero no encontrado' });
        }

        await tablero.update({
            nombre: nombre.trim(),
            tipo,
            color: color ? color.trim() : null,
            textura: textura ? textura.trim() : null,
            ancho: parseFloat(ancho),
            alto: parseFloat(alto),
            espesor: parseFloat(espesor),
            precio_tablero: parseFloat(precio_tablero),
            costo_corte: parseFloat(costo_corte),
            imagen: req.file ? req.file.filename : tablero.imagen,
            id_proveedor: parseInt(id_proveedor) || null,
            estado: estado !== undefined ? (estado === 'true' || estado === '1' || estado === 1 || estado === true) : true
        });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Actualizó el tablero: ${nombre}`);
        }
        res.json({ mensaje: 'Tablero actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el tablero en la base de datos.' });
    }
};

exports.eliminarTablero = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.query.id_usuario;

    try {
        const tablero = await Tablero.findByPk(id);
        if (!tablero) {
            return res.status(404).json({ mensaje: 'Tablero no encontrado' });
        }

        const nombreTab = tablero.nombre;
        await tablero.update({ estado: false });

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Desactivó el tablero: ${nombreTab} (eliminación lógica)`);
        }
        res.json({ mensaje: 'Tablero desactivado (eliminación lógica) correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al desactivar tablero' });
    }
};
