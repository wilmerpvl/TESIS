const conexion = require('../db');
const registrarAuditoria = require('../routes/auditoria');

exports.obtenerTiposMueble = (req, res) => {
    conexion.query(
        'SELECT * FROM tipos_mueble ORDER BY nombre ASC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.obtenerSecciones = (req, res) => {
    conexion.query(
        'SELECT * FROM secciones_mueble ORDER BY id_seccion ASC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.obtenerModulos = (req, res) => {
    const { idTipo, idSeccion } = req.params;
    const sql = `
        SELECT *
        FROM modulos
        WHERE id_tipo = ?
        AND id_seccion = ?
        ORDER BY nombre ASC
    `;
    conexion.query(sql, [idTipo, idSeccion], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerPiezas = (req, res) => {
    const { idModulo } = req.params;
    const sql = `
        SELECT *
        FROM piezas_modulo
        WHERE id_modulo = ?
        ORDER BY nombre ASC
    `;
    conexion.query(sql, [idModulo], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerTablerosCotizacion = (req, res) => {
    const sql = `
        SELECT 
            t.*,
            p.nombre AS proveedor
        FROM tableros t
        LEFT JOIN proveedores p ON t.id_proveedor = p.id_proveedor
        WHERE t.estado = 1
        ORDER BY t.tipo ASC, t.color ASC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerAccesoriosCotizacion = (req, res) => {
    const sql = `
        SELECT 
            a.*,
            p.nombre AS proveedor
        FROM accesorios a
        LEFT JOIN proveedores p ON a.id_proveedor = p.id_proveedor
        WHERE a.estado = 1
        ORDER BY a.categoria ASC, a.nombre ASC
    `;
    conexion.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.obtenerClientesCotizacion = (req, res) => {
    conexion.query(
        'SELECT * FROM clientes WHERE estado = 1 ORDER BY nombre ASC',
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
};

exports.obtenerModuloCompleto = (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT 
            m.nombre AS modulo,
            p.id_pieza,
            p.nombre AS pieza
        FROM modulos m
        LEFT JOIN piezas_modulo p ON m.id_modulo = p.id_modulo
        WHERE m.id_modulo = ?
    `;
    conexion.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

exports.guardarCotizacion = async (req, res) => {
    const {
        id_cliente,
        id_tipo,
        total_tableros,
        total_accesorios,
        mano_obra,
        transporte,
        total_final,
        detalles,
        accesorios,
        id_usuario
    } = req.body;

    let connection;
    try {
        connection = await conexion.promise().getConnection();
    } catch (e) {
        console.error("Error al obtener conexión del pool:", e);
        return res.status(500).json({ mensaje: "Error al conectar con la base de datos" });
    }

    try {
        await connection.beginTransaction();

        const sqlCotizacion = `
            INSERT INTO cotizaciones
            (
                id_cliente,
                id_tipo,
                fecha,
                total_tableros,
                total_accesorios,
                mano_obra,
                transporte,
                total_final
            )
            VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
        `;
        const [resultCot] = await connection.query(sqlCotizacion, [
            id_cliente,
            id_tipo,
            total_tableros,
            total_accesorios,
            mano_obra,
            transporte,
            total_final
        ]);
        const idCotizacion = resultCot.insertId;

        // GUARDAR DETALLES PIEZAS
        if (detalles && detalles.length > 0) {
            const piezasPromises = detalles.map(det => {
                const sqlDetalle = `
                    INSERT INTO detalle_piezas_cotizacion
                    (
                        id_cotizacion,
                        id_modulo,
                        id_pieza,
                        id_tablero,
                        ancho,
                        alto,
                        cantidad,
                        costo,
                        observacion
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                return connection.query(sqlDetalle, [
                    idCotizacion,
                    det.id_modulo,
                    det.id_pieza,
                    det.id_tablero,
                    det.ancho,
                    det.alto,
                    det.cantidad,
                    det.costo,
                    det.observacion || ''
                ]);
            });
            await Promise.all(piezasPromises);
        }

        // GUARDAR ACCESORIOS
        if (accesorios && accesorios.length > 0) {
            const accesoriosPromises = accesorios.map(acc => {
                const sqlAccesorio = `
                    INSERT INTO detalle_accesorios_cotizacion
                    (
                        id_cotizacion,
                        id_accesorio,
                        cantidad,
                        subtotal
                    )
                    VALUES (?, ?, ?, ?)
                `;
                return connection.query(sqlAccesorio, [
                    idCotizacion,
                    acc.id_accesorio,
                    acc.cantidad,
                    acc.subtotal
                ]);
            });
            await Promise.all(accesoriosPromises);
        }

        await connection.commit();

        if (id_usuario) {
            registrarAuditoria(id_usuario, "Generó cotización #" + idCotizacion);
        }

        res.json({
            message: 'Cotización guardada correctamente',
            idCotizacion
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error al guardar la cotización:", error);
        res.status(500).json({ mensaje: 'Error al procesar la cotización. Operación cancelada.' });
    } finally {
        connection.release();
    }
};

exports.obtenerCotizacionDetalle = (req, res) => {
    const { id } = req.params;

    const sqlCotizacion = `
        SELECT
            c.*,
            cli.nombre AS cliente,
            cli.correo AS cliente_correo,
            cli.telefono AS cliente_telefono,
            tm.nombre AS tipo_mueble
        FROM cotizaciones c
        INNER JOIN clientes cli ON c.id_cliente = cli.id_cliente
        INNER JOIN tipos_mueble tm ON c.id_tipo = tm.id_tipo
        WHERE c.id_cotizacion = ?
    `;

    conexion.query(sqlCotizacion, [id], (err, rowsCot) => {
        if (err) return res.status(500).json(err);
        if (rowsCot.length === 0) return res.status(404).json({ mensaje: "Cotización no encontrada" });

        const cotizacion = rowsCot[0];

        const sqlPiezas = `
            SELECT
                d.*,
                p.nombre AS pieza_nombre,
                m.nombre AS modulo_nombre,
                t.nombre AS tablero_nombre,
                t.color AS tablero_color,
                t.tipo AS tablero_tipo
            FROM detalle_piezas_cotizacion d
            LEFT JOIN piezas_modulo p ON d.id_pieza = p.id_pieza
            LEFT JOIN modulos m ON d.id_modulo = m.id_modulo
            LEFT JOIN tableros t ON d.id_tablero = t.id_tablero
            WHERE d.id_cotizacion = ?
        `;

        conexion.query(sqlPiezas, [id], (err, rowsPiezas) => {
            if (err) return res.status(500).json(err);

            const sqlAccesorios = `
                SELECT
                    da.*,
                    a.nombre AS accesorio_nombre,
                    a.precio_unitario
                FROM detalle_accesorios_cotizacion da
                INNER JOIN accesorios a ON da.id_accesorio = a.id_accesorio
                WHERE da.id_cotizacion = ?
            `;

            conexion.query(sqlAccesorios, [id], (err, rowsAccesorios) => {
                if (err) return res.status(500).json(err);

                res.json({
                    cotizacion,
                    piezas: rowsPiezas,
                    accesorios: rowsAccesorios
                });
            });
        });
    });
};
