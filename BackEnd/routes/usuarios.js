const express = require('express');
const router = express.Router();
const db = require('../db');
const registrarAuditoria = require("./auditoria");
// LISTAR USUARIOS
router.get('/usuarios', (req, res) => {
    db.query('SELECT id_usuario, nombre, email, rol, estado FROM usuarios ORDER BY id_usuario DESC', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
// CREAR USUARIO (Con validación y auditoría)
router.post('/usuarios', (req, res) => {
    const { nombre, email, password, rol, id_usuario } = req.body;
    // Validaciones de Backend
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
    // Verificar si el correo ya existe
    db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email.trim()], (errCheck, rowsCheck) => {
        if (errCheck) return res.status(500).json(errCheck);
        if (rowsCheck && rowsCheck.length > 0) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado por otro usuario.' });
        }
        db.query(
            'INSERT INTO usuarios(nombre, email, password, rol) VALUES(?,?,?,?)',
            [nombre.trim(), email.trim(), password, rol],
            (err, result) => {
                if (err) return res.status(500).json(err);
                
                // Registrar auditoría si id_usuario existe
                if (id_usuario) {
                    registrarAuditoria(
                        id_usuario,
                        `Registró al usuario: ${nombre} (${rol})`
                    );
                }
                
                res.json({ mensaje: 'Usuario registrado correctamente' });
            }
        );
    });
});
// ACTUALIZAR USUARIO (Con validación, actualización opcional de password, estado y auditoría)
router.put('/usuarios/:id', (req, res) => {
    const { nombre, email, password, rol, id_usuario, estado } = req.body;
    const id = req.params.id;
    // Validaciones de Backend
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: 'El nombre completo es obligatorio y debe tener al menos 3 caracteres.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El correo electrónico no es válido.' });
    }
    if (!rol || !['ADMIN', 'DUENO', 'EMPLEADO'].includes(rol)) {
        return res.status(400).json({ mensaje: 'El rol seleccionado no es válido.' });
    }
    // Verificar si el correo ya está en uso por otro usuario
    db.query('SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?', [email.trim(), id], (errCheck, rowsCheck) => {
        if (errCheck) return res.status(500).json(errCheck);
        if (rowsCheck && rowsCheck.length > 0) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado por otro usuario.' });
        }
        
        const estadoVal = estado !== undefined ? estado : 1;
        
        if (password && password.trim().length >= 4) {
            // Actualizar incluyendo contraseña y estado
            db.query(
                'UPDATE usuarios SET nombre=?, email=?, password=?, rol=?, estado=? WHERE id_usuario=?',
                [nombre.trim(), email.trim(), password, rol, estadoVal, id],
                (err) => {
                    if (err) return res.status(500).json(err);
                    
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Actualizó al usuario (con cambio de clave): ${nombre} (${rol})`
                        );
                    }
                    res.json({ mensaje: 'Usuario actualizado correctamente' });
                }
            );
        } else {
            // Actualizar sin alterar contraseña pero sí estado
            db.query(
                'UPDATE usuarios SET nombre=?, email=?, rol=?, estado=? WHERE id_usuario=?',
                [nombre.trim(), email.trim(), rol, estadoVal, id],
                (err) => {
                    if (err) return res.status(500).json(err);
                    
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Actualizó al usuario: ${nombre} (${rol})`
                        );
                    }
                    res.json({ mensaje: 'Usuario actualizado correctamente' });
                }
            );
        }
    });
});
// ELIMINAR USUARIO (Con verificación de relaciones para evitar errores de BD)
router.delete('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    const id_usuario = req.query.id_usuario;
    
    // Evitar que el usuario se elimine a sí mismo
    if (parseInt(id) === parseInt(id_usuario)) {
        return res.status(400).json({ mensaje: 'No puedes eliminar o desactivar tu propio usuario desde este módulo.' });
    }
    
    // 1. Verificar si el usuario está en uso en auditoría o trabajos
    const sqlCheck = `
        SELECT 
            (SELECT COUNT(*) FROM auditoria WHERE id_usuario = ?) AS totalAuditoria,
            (SELECT COUNT(*) FROM trabajo_empleado WHERE id_empleado = ?) AS totalTrabajos
    `;
    db.query(sqlCheck, [id, id], (errCheck, resultsCheck) => {
        if (errCheck) {
            console.error(errCheck);
            return res.status(500).json({ mensaje: 'Error al verificar relaciones del usuario' });
        }
        const totalAuditoria = resultsCheck[0].totalAuditoria;
        const totalTrabajos = resultsCheck[0].totalTrabajos;
        if (totalAuditoria > 0 || totalTrabajos > 0) {
            let detalles = [];
            if (totalAuditoria > 0) detalles.push(`${totalAuditoria} registro(s) de auditoría`);
            if (totalTrabajos > 0) detalles.push(`${totalTrabajos} trabajo(s) asignado(s)`);
            
            // Se le desactiva (eliminación lógica) para conservar el historial de auditoría y asignación de trabajos
            db.query('SELECT nombre, rol FROM usuarios WHERE id_usuario = ?', [id], (errBuscar, rows) => {
                const nombreUsr = (rows && rows[0]) ? `${rows[0].nombre} (${rows[0].rol})` : `con ID ${id}`;
                db.query('UPDATE usuarios SET estado = 0 WHERE id_usuario = ?', [id], (errLog) => {
                    if (errLog) return res.status(500).json(errLog);
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Desactivó al usuario: ${nombreUsr} (eliminación lógica por dependencias)`
                        );
                    }
                    res.json({ mensaje: `El usuario está asociado a ${detalles.join(' y ')}, por lo que fue desactivado (eliminación lógica) para conservar el historial.` });
                });
            });
            return;
        }
        // 2. Si no tiene relaciones, procedemos al borrado físico
        db.query('SELECT nombre, rol FROM usuarios WHERE id_usuario = ?', [id], (errBuscar, rows) => {
            const nombreUsr = (rows && rows[0]) ? `${rows[0].nombre} (${rows[0].rol})` : `con ID ${id}`;
            db.query(
                'DELETE FROM usuarios WHERE id_usuario=?',
                [id],
                (err) => {
                    if (err) return res.status(500).json(err);
                    // Registrar auditoría si id_usuario existe
                    if (id_usuario) {
                        registrarAuditoria(
                            id_usuario,
                            `Eliminó al usuario: ${nombreUsr}`
                        );
                    }
                    res.json({ mensaje: 'Usuario eliminado correctamente' });
                }
            );
        });
    });
});
module.exports = router;
