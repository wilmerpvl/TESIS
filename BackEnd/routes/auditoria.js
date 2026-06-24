const conexion = require("../db");

function registrarAuditoria(
    idUsuario,
    accion
) {

    const sql = `
        INSERT INTO auditoria
        (
            id_usuario,
            accion
        )
        VALUES
        (
            ?,
            ?
        )
    `;

    conexion.query(
        sql,
        [
            idUsuario,
            accion
        ]
    );

}

module.exports =
    registrarAuditoria;