const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default || require("jspdf-autotable");

const generarPDFCotizacionServer = (cotizacionData, imagenCorte = null) => {
    const { cotizacion, piezas, accesorios } = cotizacionData;
    const doc = new jsPDF();

    // Colores corporativos (Verde principal #1F3D2B)
    const colorPrimario = [31, 61, 43];

    // Encabezado
    doc.setFillColor(31, 61, 43);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("COTIZACIÓN DE MUEBLES", 14, 23);

    // Número de cotización en la cabecera
    doc.setFontSize(14);
    doc.text(`Nº #${cotizacion.id_cotizacion || ""}`, 196, 23, { align: "right" });

    // Grid de Información de Emisión y Cliente
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);

    // Izquierda: Empresa Emisor
    doc.setFont("helvetica", "bold");
    doc.text("EMISOR:", 14, 48);
    doc.setFont("helvetica", "normal");
    doc.text("Taller de Carpintería & Muebles S.A.", 14, 54);
    doc.text("RUC: 1792834571001", 14, 60);
    doc.text("Email: ventas@mueblescarpinteria.com", 14, 66);

    // Derecha: Cliente
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", 110, 48);
    doc.setFont("helvetica", "normal");
    doc.text(cotizacion.cliente || "Consumidor Final", 110, 54);
    if (cotizacion.cliente_correo) doc.text(`Email: ${cotizacion.cliente_correo}`, 110, 60);
    if (cotizacion.cliente_telefono) doc.text(`Teléfono: ${cotizacion.cliente_telefono}`, 110, 66);

    // Detalles generales de la cotización
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DEL SERVICIO:", 14, 80);
    doc.setFont("helvetica", "normal");

    const fechaFormateada = cotizacion.fecha ? new Date(cotizacion.fecha).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Fecha de Emisión: ${fechaFormateada}`, 14, 86);
    doc.text(`Tipo de Mueble: ${cotizacion.tipo_mueble || "Personalizado"}`, 14, 92);

    const tableroNombre = piezas && piezas[0] ? (piezas[0].tablero_nombre || piezas[0].tablero_color || "General") : "General";
    doc.text(`Tablero Principal: ${tableroNombre}`, 110, 86);
    doc.text(`Estado del Trabajo: ${cotizacion.estado || "PENDIENTE"}`, 110, 92);

    // Línea divisoria
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 98, 196, 98);

    let currentY = 104;

    // Tabla de Piezas / Cortes
    if (piezas && piezas.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(31, 61, 43);
        doc.text("Detalle de Piezas y Cortes", 14, currentY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        autoTable(doc, {
            startY: currentY + 4,
            head: [["Módulo", "Pieza", "Medidas (Ancho x Alto cm)", "Cantidad"]],
            body: piezas.map(p => {
                const anchoVal = Number(p.ancho || 0);
                const altoVal = Number(p.alto || 0);
                const cantVal = parseInt(p.cantidad || 1);
                return [
                    p.modulo_nombre || "Estructura / General",
                    p.pieza_nombre || p.observacion || "Pieza",
                    `${(isNaN(anchoVal) ? 0 : anchoVal).toFixed(1)} x ${(isNaN(altoVal) ? 0 : altoVal).toFixed(1)}`,
                    cantVal
                ];
            }),
            headStyles: { fillColor: colorPrimario, fontStyle: "bold" },
            theme: "striped",
            margin: { left: 14, right: 14 }
        });
        currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 40) + 12;
    }

    // Tabla de Accesorios
    if (accesorios && accesorios.length > 0) {
        if (currentY > 230) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(31, 61, 43);
        doc.text("Accesorios Adicionales", 14, currentY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        autoTable(doc, {
            startY: currentY + 4,
            head: [["Accesorio", "Precio Unitario", "Cantidad", "Subtotal"]],
            body: accesorios.map(a => {
                const cantVal = parseInt(a.cantidad || 1);
                const subtotalVal = Number(a.subtotal || 0);
                const precioUnitVal = Number(a.precio_unitario || (cantVal > 0 ? subtotalVal / cantVal : 0) || 0);

                const puSafe = isNaN(precioUnitVal) || !isFinite(precioUnitVal) ? 0 : precioUnitVal;
                const subSafe = isNaN(subtotalVal) || !isFinite(subtotalVal) ? 0 : subtotalVal;

                return [
                    a.accesorio_nombre || "Accesorio",
                    `$${puSafe.toFixed(2)}`,
                    cantVal,
                    `$${subSafe.toFixed(2)}`
                ];
            }),
            headStyles: { fillColor: colorPrimario, fontStyle: "bold" },
            theme: "striped",
            margin: { left: 14, right: 14 }
        });
        currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 40) + 12;
    }

    // Sección de Totales
    if (currentY > 210) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.rect(110, currentY, 86, 50, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(110, currentY, 86, 50, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104);

    const safeNum = (val) => {
        const n = Number(val || 0);
        return isNaN(n) || !isFinite(n) ? 0 : n;
    };

    doc.text("Costo Tableros:", 114, currentY + 8);
    doc.text(`$${safeNum(cotizacion.total_tableros).toFixed(2)}`, 192, currentY + 8, { align: "right" });

    doc.text("Costo Accesorios:", 114, currentY + 16);
    doc.text(`$${safeNum(cotizacion.total_accesorios).toFixed(2)}`, 192, currentY + 16, { align: "right" });

    doc.text("Mano de Obra:", 114, currentY + 24);
    doc.text(`$${safeNum(cotizacion.mano_obra).toFixed(2)}`, 192, currentY + 24, { align: "right" });

    doc.text("Transporte:", 114, currentY + 32);
    doc.text(`$${safeNum(cotizacion.transporte).toFixed(2)}`, 192, currentY + 32, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("TOTAL COTIZADO:", 114, currentY + 44);
    doc.text(`$${safeNum(cotizacion.total_final).toFixed(2)}`, 192, currentY + 44, { align: "right" });

    // Página 2: Distribución de Cortes (Diagrama del Tablero)
    const piezasValidas = (piezas || []).filter(p => Number(p.ancho || 0) > 0 && Number(p.alto || 0) > 0);
    if (piezasValidas.length > 0 || imagenCorte) {
        doc.addPage();
        currentY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(31, 61, 43);
        doc.text("Diagrama de Distribución de Cortes", 14, currentY);
        currentY += 10;

        const colorNombre = piezas && piezas[0] ? (piezas[0].tablero_color || piezas[0].tablero_nombre || "Visón Verde") : "Visón Verde";
        doc.setFontSize(11);
        doc.text(`TABLÓN 1 - ${colorNombre}`, 14, currentY);
        currentY += 6;

        if (imagenCorte) {
            doc.addImage(imagenCorte, "PNG", 14, currentY, 182, 100);
        } else {
            // Dibujado Vectorial Nativo del Tablero 2D
            const boardX = 14;
            const boardY = currentY;
            const boardW = 182;
            const boardH = 100;

            doc.setFillColor(241, 245, 249);
            doc.rect(boardX, boardY, boardW, boardH, "F");
            doc.setDrawColor(30, 41, 59);
            doc.setLineWidth(0.8);
            doc.rect(boardX, boardY, boardW, boardH, "S");

            let currX = boardX;
            let currY = boardY;
            let rowH = 0;

            const boardRealW = 244;
            const boardRealH = 183;
            const scaleX = boardW / boardRealW;
            const scaleY = boardH / boardRealH;

            piezasValidas.forEach((p) => {
                const pW = Number(p.ancho || 0);
                const pH = Number(p.alto || 0);
                const cant = parseInt(p.cantidad || 1);

                for (let c = 0; c < cant; c++) {
                    const drawW = Math.min(pW * scaleX, boardW - (currX - boardX));
                    const drawH = Math.min(pH * scaleY, boardH - (currY - boardY));

                    if (currX + drawW > boardX + boardW + 0.1) {
                        currX = boardX;
                        currY += rowH;
                        rowH = 0;
                    }

                    if (currY + drawH <= boardY + boardH + 0.1) {
                        doc.setFillColor(95, 127, 104);
                        doc.rect(currX, currY, drawW, drawH, "F");
                        doc.setDrawColor(30, 41, 59);
                        doc.setLineWidth(0.3);
                        doc.rect(currX, currY, drawW, drawH, "S");

                        doc.setTextColor(255, 255, 255);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(8);
                        const labelNombre = p.pieza_nombre || p.observacion || "Pieza";
                        doc.text(labelNombre, currX + drawW / 2, currY + drawH / 2 - 1, { align: "center" });

                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(7);
                        doc.text(`${pW.toFixed(1)} x ${pH.toFixed(1)} cm`, currX + drawW / 2, currY + drawH / 2 + 3, { align: "center" });

                        currX += drawW;
                        if (drawH > rowH) rowH = drawH;
                    }
                }
            });
        }
    }

    return Buffer.from(doc.output("arraybuffer"));
};

module.exports = { generarPDFCotizacionServer };
