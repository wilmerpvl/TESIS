const conexion = require('../db');
const registrarAuditoria = require('../routes/auditoria');

exports.obtenerTrabajosDisponibles = (req, res) => {
    const sql = `
        SELECT
            c.id_cotizacion,
            c.fecha,
            c.total_final,
            cl.nombre AS cliente,
            tm.nombre AS tipo_mueble
        FROM cotizaciones c
        INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE c.estado = 'PENDIENTE'
        ORDER BY c.id_cotizacion DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.crearTrabajo = (req, res) => {
    const {
        id_cotizacion,
        fecha_estimada,
        prioridad,
        id_usuario
    } = req.body;
    const sql = `
        INSERT INTO trabajos (id_cotizacion, fecha_inicio, fecha_estimada, prioridad)
        VALUES (?, CURDATE(), ?, ?)
    `;
    conexion.query(sql, [id_cotizacion, fecha_estimada, prioridad], (err, result) => {
        if (err) return res.status(500).json(err);

        // Cambiar estado de la cotización a APROBADA
        conexion.query(
            "UPDATE cotizaciones SET estado='APROBADA' WHERE id_cotizacion=?",
            [id_cotizacion]
        );

        if (id_usuario) {
            registrarAuditoria(id_usuario, "Creó trabajo #" + result.insertId + " para cotización #" + id_cotizacion);
        }
        res.json({ mensaje: 'Trabajo creado correctamente' });
    });
};

exports.obtenerTrabajos = (req, res) => {
    const sql = `
        SELECT
            t.*,
            c.total_final,
            cl.nombre AS cliente,
            tm.nombre AS tipo_mueble
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        ORDER BY t.id_trabajo DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.finalizarTrabajo = (req, res) => {
    const id = req.params.id;
    const { id_usuario } = req.body;
    const sql = `
        UPDATE trabajos
        SET estado='COMPLETADO', fecha_fin=CURDATE()
        WHERE id_trabajo=?
    `;
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json(err);

        if (id_usuario) {
            registrarAuditoria(id_usuario, "Finalizó trabajo #" + id);
        }
        res.json({ mensaje: 'Trabajo finalizado' });
    });
};

exports.asignarEmpleado = (req, res) => {
    const {
        id_trabajo,
        id_empleado,
        id_usuario
    } = req.body;
    const sql = `
        INSERT INTO trabajo_empleado (id_trabajo, id_empleado)
        VALUES (?, ?)
    `;
    conexion.query(sql, [id_trabajo, id_empleado], (err) => {
        if (err) return res.status(500).json(err);

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Asignó empleado ID #${id_empleado} al trabajo #${id_trabajo}`);
        }
        res.json({ mensaje: 'Empleado asignado' });
    });
};
