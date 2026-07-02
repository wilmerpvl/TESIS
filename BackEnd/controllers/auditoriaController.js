const conexion = require("../db");

exports.obtenerAuditoria = (req, res) => {
    const sql = `
        SELECT
            a.id_auditoria,
            u.nombre,
            u.rol,
            a.accion,
            a.fecha
        FROM auditoria a
        INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
        ORDER BY a.fecha DESC
    `;

    conexion.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};
