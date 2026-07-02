const conexion = require('../db');
const registrarAuditoria = require('../routes/auditoria');

exports.obtenerTrabajosProgreso = (req, res) => {
    const sql = `
        SELECT
            t.id_trabajo,
            t.fecha_inicio,
            t.fecha_estimada,
            t.estado,
            c.id_cotizacion,
            c.total_final,
            cli.nombre AS cliente,
            tm.nombre AS tipo_mueble,
            CAST(COALESCE(
                (
                    SELECT SUM(a.porcentaje)
                    FROM avances a
                    WHERE a.id_trabajo = t.id_trabajo
                ),
                0
            ) AS SIGNED) AS avance
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE t.estado = 'EN_PROCESO'
        ORDER BY t.id_trabajo DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerTrabajosCompletados = (req, res) => {
    const sql = `
        SELECT
            t.id_trabajo,
            t.fecha_inicio,
            t.fecha_fin,
            t.estado,
            c.id_cotizacion,
            c.total_final,
            cli.nombre AS cliente,
            tm.nombre AS tipo_mueble,
            100 AS avance
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE t.estado = 'COMPLETADO'
        ORDER BY t.fecha_fin DESC, t.id_trabajo DESC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerDetalleTrabajo = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT
            t.*,
            c.id_cotizacion,
            c.total_final,
            cli.nombre AS cliente,
            tm.nombre AS tipo_mueble,
            CAST(COALESCE(
                (
                    SELECT SUM(a.porcentaje)
                    FROM avances a
                    WHERE a.id_trabajo = t.id_trabajo
                ),
                0
            ) AS SIGNED) AS avance
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.id_cotizacion = c.id_cotizacion
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE t.id_trabajo = ?
    `;
    conexion.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
};

exports.obtenerAvances = (req, res) => {
    const { idTrabajo } = req.params;
    const sql = `
        SELECT 
            a.*,
            u.nombre AS registrado_por,
            e.url_imagen
        FROM avances a
        LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
        LEFT JOIN evidencias e ON a.id_avance = e.id_avance
        WHERE a.id_trabajo = ?
        ORDER BY a.fecha DESC, a.id_avance DESC
    `;
    conexion.query(sql, [idTrabajo], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerEvidencias = (req, res) => {
    const { idAvance } = req.params;
    const sql = `
        SELECT *
        FROM evidencias
        WHERE id_avance = ?
    `;
    conexion.query(sql, [idAvance], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.registrarAvance = (req, res) => {
    const {
        id_trabajo,
        porcentaje,
        descripcion,
        id_usuario,
        fecha
    } = req.body;
    const porcentajeInt = parseInt(porcentaje);

    if (isNaN(porcentajeInt) || porcentajeInt < 0 || porcentajeInt > 100) {
        return res.status(400).json({
            message: "El porcentaje debe ser un número entero entre 0 y 100."
        });
    }

    const sqlSuma = `SELECT CAST(COALESCE(SUM(porcentaje), 0) AS SIGNED) AS sumaActual FROM avances WHERE id_trabajo = ?`;
    conexion.query(sqlSuma, [id_trabajo], (errSuma, rowsSuma) => {
        if (errSuma) {
            console.error(errSuma);
            return res.status(500).json({ message: "Error al verificar el avance acumulado." });
        }
        const sumaActual = Number(rowsSuma[0].sumaActual);
        if (sumaActual + porcentajeInt > 100) {
            return res.status(400).json({
                message: `El avance total no puede superar el 100%. Actualmente el avance acumulado es de ${sumaActual}%, por lo que solo puede registrar un avance máximo del ${100 - sumaActual}%.`
            });
        }

        const sql = `
            INSERT INTO avances (id_trabajo, porcentaje, descripcion, fecha, id_usuario)
            VALUES (?, ?, ?, ?, ?)
        `;
        conexion.query(
            sql,
            [
                id_trabajo,
                porcentajeInt,
                descripcion,
                fecha && fecha.trim() !== "" ? fecha : new Date(),
                id_usuario || null
            ],
            (err, result) => {
                if (err) return res.status(500).json(err);
                
                const idAvance = result.insertId;

                // SI SUBIERON FOTO
                if (req.file) {
                    const rutaImagen = "/uploads/" + req.file.filename;
                    conexion.query(
                        `INSERT INTO evidencias (id_avance, url_imagen) VALUES (?, ?)`,
                        [idAvance, rutaImagen]
                    );
                }

                if (id_usuario) {
                    registrarAuditoria(
                        id_usuario,
                        `Registró avance de trabajo #${id_trabajo} (${porcentajeInt}%)`
                    );
                }
                res.json({ message: "Avance registrado correctamente" });
            }
        );
    });
};

exports.guardarEvidencia = (req, res) => {
    const { id_avance, url_imagen } = req.body;
    const sql = `
        INSERT INTO evidencias (id_avance, url_imagen)
        VALUES (?, ?)
    `;
    conexion.query(sql, [id_avance, url_imagen], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Evidencia guardada' });
    });
};

exports.finalizarTrabajo = (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;
    const sql = `
        UPDATE trabajos
        SET estado = 'COMPLETADO', fecha_fin = CURDATE()
        WHERE id_trabajo = ?
    `;
    conexion.query(sql, [id], (err) => {
        if (err) return res.status(500).json(err);

        if (id_usuario) {
            registrarAuditoria(id_usuario, `Finalizó y completó el trabajo #${id}`);
        }
        res.json({ message: 'Trabajo completado' });
    });
};
