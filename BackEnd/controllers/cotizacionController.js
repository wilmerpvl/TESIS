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
        res.status(500).json({ mensaje: 'Error al procesar la cotización. Operación cancelada.' });
    } finally {
        connection.release();
    }
};

exports.enviarCotizacionCorreo = (req, res) => {
    const { id } = req.params;
    const { pdfBase64 } = req.body || {};

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
        const destinatario = cotizacion.cliente_correo;

        if (!destinatario) {
            return res.status(400).json({ mensaje: "El cliente no tiene un correo electrónico registrado." });
        }

        const sqlPiezas = `
            SELECT
                d.*,
                p.nombre AS pieza_nombre,
                m.nombre AS modulo_nombre,
                t.nombre AS tablero_nombre,
                t.color AS tablero_color
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
                    a.nombre AS accesorio_nombre
                FROM detalle_accesorios_cotizacion da
                INNER JOIN accesorios a ON da.id_accesorio = a.id_accesorio
                WHERE da.id_cotizacion = ?
            `;

            conexion.query(sqlAccesorios, [id], (err, rowsAccesorios) => {
                if (err) return res.status(500).json(err);

                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
                        <div style="background-color: #3b7f4a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 22px;">Cotización #${cotizacion.id_cotizacion}</h1>
                            <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 14px;">Muebles a Medida - Universidad de Guayaquil</p>
                        </div>
                        <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                            <p>Estimado(a) <strong>${cotizacion.cliente}</strong>,</p>
                            <p>Adjunto a este correo encontrará el documento PDF detallado con su cotización comercial.</p>

                            <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #1e293b;">Resumen de la Cotización</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Mueble:</td>
                                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${cotizacion.tipo_mueble}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #64748b;">Fecha:</td>
                                        <td style="padding: 6px 0; font-weight: bold; text-align: right;">${new Date(cotizacion.fecha).toLocaleDateString()}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #cbd5e1;">
                                        <td style="padding: 10px 0 0 0; color: #1e293b; font-weight: bold; font-size: 16px;">Total Final:</td>
                                        <td style="padding: 10px 0 0 0; color: #24833c; font-weight: bold; font-size: 20px; text-align: right;">$${Number(cotizacion.total_final).toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>

                            <p style="font-size: 13px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                                Este es un correo automático del Sistema de Gestión y Cotizaciones de Muebles a Medida.
                            </p>
                        </div>
                    </div>
                `;

                const mailOptions = {
                    from: `"Mueblería UG" <${process.env.SMTP_USER || "noreply@muebles.com"}>`,
                    to: destinatario,
                    subject: `Cotización #${cotizacion.id_cotizacion} - Muebles a Medida`,
                    html: htmlContent,
                    attachments: pdfBase64 ? [
                        {
                            filename: `cotizacion-${cotizacion.id_cotizacion}.pdf`,
                            content: pdfBase64,
                            encoding: 'base64'
                        }
                    ] : []
                };

                const sendMailWithTransporter = (t, mOptions, isFallback = false) => {
                    t.sendMail(mOptions, (errorMail, info) => {
                        if (errorMail) {
                            console.error("Error al enviar correo con transporter:", errorMail.message);
                            if (!isFallback) {
                                console.warn("Intentando envío alternativo mediante Ethereal...");
                                nodemailer.createTestAccount((errAccount, account) => {
                                    if (errAccount) {
                                        return res.status(500).json({ mensaje: "Error al enviar el correo.", detalle: errorMail.message });
                                    }
                                    const fallbackTransporter = nodemailer.createTransport({
                                        host: account.smtp.host,
                                        port: account.smtp.port,
                                        secure: account.smtp.secure,
                                        auth: {
                                            user: account.user,
                                            pass: account.pass
                                        }
                                    });
                                    const fallbackOptions = {
                                        ...mOptions,
                                        from: `"Mueblería UG" <${account.user}>`
                                    };
                                    sendMailWithTransporter(fallbackTransporter, fallbackOptions, true);
                                });
                            } else {
                                return res.status(500).json({ mensaje: "Error al enviar el correo.", detalle: errorMail.message });
                            }
                        } else {
                            const previewUrl = nodemailer.getTestMessageUrl(info);
                            res.json({ 
                                mensaje: "Correo enviado correctamente a " + destinatario, 
                                previewUrl: previewUrl || null 
                            });
                        }
                    });
                };

                if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
                    nodemailer.createTestAccount((errAccount, account) => {
                        if (errAccount) {
                            return res.status(500).json({ mensaje: "Error de configuración de correo." });
                        }
                        const testTransporter = nodemailer.createTransport({
                            host: account.smtp.host,
                            port: account.smtp.port,
                            secure: account.smtp.secure,
                            auth: {
                                user: account.user,
                                pass: account.pass
                            }
                        });
                        const options = {
                            ...mailOptions,
                            from: `"Mueblería UG" <${account.user}>`
                        };
                        sendMailWithTransporter(testTransporter, options, true);
                    });
                } else {
                    const envTransporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT || "587"),
                        secure: process.env.SMTP_SECURE === "true",
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS
                        }
                    });
                    sendMailWithTransporter(envTransporter, mailOptions, false);
                }
            });
        });
    });
};

exports.actualizarCotizacion = async (req, res) => {
    const { id } = req.params;
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
        connection = await pool.getConnection();
    } catch (e) {
        console.error("Error al obtener conexión del pool:", e);
        return res.status(500).json({ mensaje: "Error al conectar con la base de datos" });
    }

    try {
        await connection.beginTransaction();

        const sqlUpdate = `
            UPDATE cotizaciones
            SET id_cliente = ?, id_tipo = ?, total_tableros = ?, total_accesorios = ?, mano_obra = ?, transporte = ?, total_final = ?
            WHERE id_cotizacion = ?
        `;
        await connection.query(sqlUpdate, [
            id_cliente,
            id_tipo,
            total_tableros,
            total_accesorios,
            mano_obra,
            transporte,
            total_final,
            id
        ]);

        await connection.query("DELETE FROM detalle_piezas_cotizacion WHERE id_cotizacion = ?", [id]);
        await connection.query("DELETE FROM detalle_accesorios_cotizacion WHERE id_cotizacion = ?", [id]);

        if (detalles && detalles.length > 0) {
            const piezasPromises = detalles.map(det => {
                const sqlDetalle = `
                    INSERT INTO detalle_piezas_cotizacion
                    (id_cotizacion, id_modulo, id_pieza, id_tablero, ancho, alto, cantidad, costo, observacion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                return connection.query(sqlDetalle, [
                    id,
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

        if (accesorios && accesorios.length > 0) {
            const accesoriosPromises = accesorios.map(acc => {
                const sqlAccesorio = `
                    INSERT INTO detalle_accesorios_cotizacion
                    (id_cotizacion, id_accesorio, cantidad, subtotal)
                    VALUES (?, ?, ?, ?)
                `;
                return connection.query(sqlAccesorio, [
                    id,
                    acc.id_accesorio,
                    acc.cantidad,
                    acc.subtotal
                ]);
            });
            await Promise.all(accesoriosPromises);
        }

        await connection.commit();

        if (id_usuario) {
            registrarAuditoria(id_usuario, "Actualizó la cotización #" + id);
        }

        res.json({
            message: 'Cotización actualizada correctamente',
            idCotizacion: id
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar la cotización:", error);
        res.status(500).json({ mensaje: 'Error al actualizar la cotización. Operación cancelada.' });
    } finally {
        connection.release();
    }
};

exports.eliminarCotizacion = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body || {};

    let connection;
    try {
        connection = await pool.getConnection();
    } catch (e) {
        console.error("Error al obtener conexión:", e);
        return res.status(500).json({ mensaje: "Error al conectar con la base de datos" });
    }

    try {
        await connection.beginTransaction();

        await connection.query("DELETE FROM avance_trabajo WHERE id_trabajo IN (SELECT id_trabajo FROM trabajos WHERE id_cotizacion = ?)", [id]);
        await connection.query("DELETE FROM trabajos WHERE id_cotizacion = ?", [id]);
        await connection.query("DELETE FROM detalle_piezas_cotizacion WHERE id_cotizacion = ?", [id]);
        await connection.query("DELETE FROM detalle_accesorios_cotizacion WHERE id_cotizacion = ?", [id]);
        
        await connection.query("DELETE FROM cotizaciones WHERE id_cotizacion = ?", [id]);

        await connection.commit();

        if (id_usuario) {
            registrarAuditoria(id_usuario, "Eliminó la cotización #" + id);
        }

        res.json({ mensaje: "Cotización eliminada correctamente" });
    } catch (error) {
        await connection.rollback();
        console.error("Error al eliminar cotización:", error);
        res.status(500).json({ mensaje: "Error al eliminar la cotización" });
    } finally {
        connection.release();
    }
};

