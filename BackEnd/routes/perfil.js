const express = require("express");
const router = express.Router();
const conexion = require("../db");
const registrarAuditoria = require("./auditoria");

// OBTENER PERFIL
router.get("/perfil/:id", (req, res) => {
    const { id } = req.params;

    conexion.query(
        `
        SELECT
            id_usuario,
            nombre,
            email,
            rol,
            estado
        FROM usuarios
        WHERE id_usuario = ?
        `,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result[0]);
        }
    );
});

// ACTUALIZAR PERFIL (Con validaciones de servidor, email único, cambio opcional de contraseña y auditoría)
router.put("/perfil/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
        return res.status(400).json({ mensaje: "El nombre es obligatorio y debe tener al menos 3 caracteres." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: "Ingrese un correo electrónico válido." });
    }

    // Verificar si el correo ya está en uso por otro usuario
    conexion.query(
        "SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?",
        [email.trim(), id],
        (errCheck, rowsCheck) => {
            if (errCheck) return res.status(500).json(errCheck);
            if (rowsCheck && rowsCheck.length > 0) {
                return res.status(400).json({ mensaje: "El correo electrónico ya está registrado por otro usuario." });
            }

            if (password && password.trim().length >= 4) {
                // Actualizar perfil incluyendo contraseña
                conexion.query(
                    `
                    UPDATE usuarios
                    SET
                        nombre = ?,
                        email = ?,
                        password = ?
                    WHERE id_usuario = ?
                    `,
                    [nombre.trim(), email.trim(), password, id],
                    (err) => {
                        if (err) return res.status(500).json(err);
                        
                        // Registrar auditoría
                        registrarAuditoria(id, "Actualizó su información de perfil y contraseña");
                        
                        res.json({ mensaje: "Perfil y contraseña actualizados correctamente" });
                    }
                );
            } else {
                // Actualizar perfil sin cambiar contraseña
                conexion.query(
                    `
                    UPDATE usuarios
                    SET
                        nombre = ?,
                        email = ?
                    WHERE id_usuario = ?
                    `,
                    [nombre.trim(), email.trim(), id],
                    (err) => {
                        if (err) return res.status(500).json(err);
                        
                        // Registrar auditoría
                        registrarAuditoria(id, "Actualizó su información de perfil");
                        
                        res.json({ mensaje: "Perfil actualizado correctamente" });
                    }
                );
            }
        }
    );
});

module.exports = router;