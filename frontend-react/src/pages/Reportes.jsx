import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";

export default function Reportes() {


    const [resumen, setResumen] =
        useState({});
    const [alertaModal, setAlertaModal] = useState({
        visible: false,
        titulo: "",
        mensaje: "",
        tipo: "warning"
    });

    const mostrarAlerta = (mensaje, titulo = "Atención", tipo = "warning") => {
        setAlertaModal({
            visible: true,
            titulo,
            mensaje,
            tipo
        });
    };

    const [cotizaciones, setCotizaciones] =
        useState([]);

    const [materiales, setMateriales] =
        useState([]);

    const [trabajos, setTrabajos] =
        useState([]);

    const [accesorios,
        setAccesorios] =
        useState([]);

    const [buscarCotizacion, setBuscarCotizacion] =
        useState("");

    useEffect(() => {

        cargarDatos();

    }, []);

    const cargarDatos = async () => {
        try {
            // Ejecución en paralelo de todas las llamadas de reportes (Promise.all)
            const [resumenRes, materialesRes, trabajosRes, cotizacionesRes, accesoriosRes] = await Promise.all([
                api.get("/reportes/resumen"),
                api.get("/reportes/materiales"),
                api.get("/reportes/trabajos"),
                api.get("/reportes/cotizaciones"),
                api.get("/reportes/accesorios")
            ]);

            setResumen(resumenRes.data);
            setMateriales(materialesRes.data);
            setTrabajos(trabajosRes.data);
            setCotizaciones(cotizacionesRes.data);
            setAccesorios(accesoriosRes.data);
        }
        catch (error) {
            console.error("Error al cargar los reportes:", error);
        }
    };

    const descargarCotizacionPDF = async (c) => {
        try {
            const res = await api.get(`/cotizacion-detalle/${c.id_cotizacion}`);
            const data = res.data;
            
            // Generar el diagrama de distribución de cortes en un canvas oculto
            let base64Image = null;
            if (data.piezas && data.piezas.length > 0) {
                const canvas = document.createElement("canvas");
                const piezasFormateadas = data.piezas.map(p => ({
                    nombre: p.pieza_nombre || "Pieza",
                    ancho: parseFloat(p.ancho),
                    alto: parseFloat(p.alto),
                    cantidad: p.cantidad
                }));
                const tableroColor = data.piezas[0]?.tablero_color || "Blanco";
                
                // Dibujamos en el canvas
                const { dibujar } = await import("../utils/dibujar");
                dibujar({ current: canvas }, piezasFormateadas, tableroColor);
                base64Image = canvas.toDataURL("image/png");
            }
            
            // Usar el generador de PDF unificado
            const { generarPDFCotizacion } = await import("../utils/pdfGenerator");
            generarPDFCotizacion(data, base64Image);
        } catch (error) {
            console.error("Error al descargar el PDF de cotización:", error);
            mostrarAlerta("Error al generar el reporte en PDF.", "Error", "error");
        }
    };

    const descargarPDF = () => {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Reporte de Ingresos Mensuales", 14, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 26);
        
        const datosMes = obtenerIngresosPorMes();
        
        const colResumen = ["Mes", "Total Ingresos"];
        const filaResumen = datosMes.map(d => [d.mes, `$${Number(d.total).toFixed(2)}`]);
        
        autoTable(doc, {
            startY: 32,
            head: [colResumen],
            body: filaResumen,
            theme: "striped",
            headStyles: { fillColor: [47, 93, 68] },
            styles: { fontSize: 10 }
        });
        
        let chartStartY = doc.lastAutoTable.finalY + 15;
        
        if (datosMes.length > 0) {
            if (chartStartY + 80 > 280) {
                doc.addPage();
                chartStartY = 20;
            }
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Gráfico de Ingresos por Mes", 14, chartStartY);
            
            const chartX = 30;
            const chartY = chartStartY + 10;
            const chartW = 150;
            const chartH = 60;
            
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(chartX, chartY, chartX, chartY + chartH);
            doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);
            
            const maxVal = Math.max(...datosMes.map(d => d.total), 100);
            const ticks = 4;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(120);
            for (let i = 0; i <= ticks; i++) {
                const val = (maxVal / ticks) * i;
                const yPos = chartY + chartH - (val / maxVal) * chartH;
                
                doc.setDrawColor(230);
                if (i > 0) {
                    doc.line(chartX, yPos, chartX + chartW, yPos);
                }
                doc.text(`$${val.toFixed(0)}`, chartX - 12, yPos + 2, { align: "right" });
            }
            
            const barSpacing = chartW / (datosMes.length + 1);
            datosMes.forEach((d, index) => {
                const xPos = chartX + barSpacing * (index + 1);
                const barH = (d.total / maxVal) * chartH;
                const barW = Math.min(25, barSpacing * 0.6);
                
                doc.setFillColor(16, 185, 129);
                doc.rect(xPos - barW / 2, chartY + chartH - barH, barW, barH, "F");
                
                doc.text(d.mes, xPos, chartY + chartH + 5, { align: "center" });
                
                doc.setFont("helvetica", "bold");
                doc.setTextColor(50);
                doc.text(`$${Number(d.total).toFixed(0)}`, xPos, chartY + chartH - barH - 2, { align: "center" });
                doc.setFont("helvetica", "normal");
                doc.setTextColor(120);
            });
        }
        
        doc.save("reporte-ingresos-mensuales.pdf");
    };

    const descargarResumenPDF = () => {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Reporte de Resumen General", 14, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 26);
        
        const columnas = ["Indicador", "Valor"];
        const filas = [
            ["Cotizaciones registradas", resumen.cotizaciones || 0],
            ["Trabajos en proceso", resumen.trabajos || 0],
            ["Clientes registrados", resumen.clientes || 0],
            ["Empleados activos", resumen.empleados || 0],
            ["Facturación total", `$${Number(resumen.facturacion || 0).toFixed(2)}`]
        ];
        
        autoTable(doc, {
            startY: 32,
            head: [columnas],
            body: filas,
            theme: "striped",
            headStyles: { fillColor: [31, 61, 43] },
            styles: { fontSize: 10 }
        });
        
        doc.save("reporte-resumen-general.pdf");
    };

    const descargarMaterialesPDF = () => {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Reporte de Materiales Más Utilizados", 14, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 26);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Tableros Más Utilizados", 14, 35);
        
        const colTableros = ["Tablero", "Veces usado"];
        const filaTableros = materiales.map(m => [m.nombre, m.veces]);
        
        autoTable(doc, {
            startY: 38,
            head: [colTableros],
            body: filaTableros,
            theme: "striped",
            headStyles: { fillColor: [47, 93, 68] },
            styles: { fontSize: 9 }
        });
        
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Accesorios Más Utilizados", 14, finalY);
        
        const colAccesorios = ["Accesorio", "Veces usado"];
        const filaAccesorios = accesorios.map(a => [a.nombre, a.veces]);
        
        autoTable(doc, {
            startY: finalY + 3,
            head: [colAccesorios],
            body: filaAccesorios,
            theme: "striped",
            headStyles: { fillColor: [47, 93, 68] },
            styles: { fontSize: 9 }
        });
        
        doc.save("reporte-materiales-utilizados.pdf");
    };

    const descargarTrabajosPDF = () => {
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Reporte de Estado de Trabajos", 14, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 26);
        
        const datosEstado = obtenerTrabajosPorEstado();
        const totalTrabajos = datosEstado.reduce((acc, d) => acc + d.cantidad, 0);
        
        const colResumen = ["Estado", "Cantidad", "Porcentaje"];
        const filaResumen = datosEstado.map(d => {
            const pct = totalTrabajos > 0 ? (d.cantidad / totalTrabajos) * 100 : 0;
            return [d.estado, d.cantidad, `${pct.toFixed(0)}%`];
        });
        
        autoTable(doc, {
            startY: 32,
            head: [colResumen],
            body: filaResumen,
            theme: "striped",
            headStyles: { fillColor: [59, 127, 74] },
            styles: { fontSize: 10 }
        });
        
        let chartStartY = doc.lastAutoTable.finalY + 15;
        
        if (totalTrabajos > 0) {
            if (chartStartY + 60 > 280) {
                doc.addPage();
                chartStartY = 20;
            }
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Gráfico de Distribución de Trabajos", 14, chartStartY);
            
            const barX = 14;
            const barY = chartStartY + 8;
            const barW = 180;
            const barH = 12;
            
            doc.setFillColor(241, 245, 249);
            doc.rect(barX, barY, barW, barH, "F");
            
            const coloresEstado = {
                COMPLETADO: [16, 185, 129],
                EN_PROCESO: [59, 130, 246],
                PENDIENTE: [245, 158, 11]
            };
            
            let acumuladoX = 0;
            datosEstado.forEach(d => {
                if (d.cantidad === 0) return;
                const pct = d.cantidad / totalTrabajos;
                const sliceW = pct * barW;
                const color = coloresEstado[d.estado] || [148, 163, 184];
                
                doc.setFillColor(color[0], color[1], color[2]);
                doc.rect(barX + acumuladoX, barY, sliceW, barH, "F");
                acumuladoX += sliceW;
            });
            
            let leyendaY = barY + barH + 10;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            
            let leyendaX = 14;
            datosEstado.forEach(d => {
                const color = coloresEstado[d.estado] || [148, 163, 184];
                const pct = totalTrabajos > 0 ? (d.cantidad / totalTrabajos) * 100 : 0;
                
                doc.setFillColor(color[0], color[1], color[2]);
                doc.rect(leyendaX, leyendaY - 3, 4, 4, "F");
                
                doc.setTextColor(50);
                doc.text(`${d.estado}: ${d.cantidad} (${pct.toFixed(0)}%)`, leyendaX + 6, leyendaY);
                
                leyendaX += 60;
            });
        }
        
        const finalY = (totalTrabajos > 0) ? chartStartY + 45 : chartStartY;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Detalle de Trabajos Individuales", 14, finalY);
        
        const colDetalle = ["Trabajo #", "Cliente", "Estado", "Avance (%)"];
        const filaDetalle = trabajos.map(t => [
            `#${t.id_trabajo}`,
            t.cliente,
            t.estado,
            `${t.avance}%`
        ]);
        
        autoTable(doc, {
            startY: finalY + 4,
            head: [colDetalle],
            body: filaDetalle,
            theme: "striped",
            headStyles: { fillColor: [71, 85, 105] },
            styles: { fontSize: 9 }
        });
        
        doc.save("reporte-estado-trabajos.pdf");
    };

    const obtenerIngresosPorMes = () => {
        const ingresos = {};
        cotizaciones.forEach(c => {
            if (c.fecha && c.estado === "APROBADA") {
                const fechaObj = new Date(c.fecha);
                if (isNaN(fechaObj.getTime())) return;
                const mes = fechaObj.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
                ingresos[mes] = (ingresos[mes] || 0) + parseFloat(c.total_final);
            }
        });
        return Object.entries(ingresos)
            .map(([mes, total]) => ({ mes, total }))
            .sort((a, b) => {
                const partsA = a.mes.split(" ");
                const partsB = b.mes.split(" ");
                return new Date(partsA[0] + " 1, " + partsA[1]) - new Date(partsB[0] + " 1, " + partsB[1]);
            })
            .slice(-6); // Últimos 6 meses
    };

    const obtenerTrabajosPorEstado = () => {
        const estados = { PENDIENTE: 0, EN_PROCESO: 0, COMPLETADO: 0 };
        trabajos.forEach(t => {
            const est = t.estado || "PENDIENTE";
            estados[est] = (estados[est] || 0) + 1;
        });
        return Object.entries(estados).map(([estado, cantidad]) => ({ estado, cantidad }));
    };

    return (

        <div>

            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>

                <div className="page-title">

                    <div className="icon-box">
                        📈
                    </div>

                    <div>

                        <h1>
                            Reportes
                        </h1>

                        <p>
                            Estadísticas y reportes del sistema
                        </p>

                    </div>

                </div>

                <button
                    className="btn-green"
                    onClick={descargarResumenPDF}
                    style={{
                        backgroundColor: "var(--verde-principal)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600",
                        padding: "10px 18px",
                        borderRadius: "8px"
                    }}
                >
                    📊 Descargar Resumen General
                </button>

            </div>



            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "20px",
                    marginBottom: "20px"
                }}
            >

                <div className="card">

                    <h3>
                        💰 Cotizaciones
                    </h3>

                    <h1>
                        {
                            resumen.cotizaciones || 0
                        }
                    </h1>

                </div>

                <div className="card">

                    <h3>
                        📋 Trabajos
                    </h3>

                    <h1>
                        {
                            resumen.trabajos || 0
                        }
                    </h1>

                </div>

                <div className="card">

                    <h3>
                        👥 Clientes
                    </h3>

                    <h1>
                        {
                            resumen.clientes || 0
                        }
                    </h1>

                </div>

                <div className="card">

                    <h3>
                        👷 Empleados
                    </h3>

                    <h1>
                        {
                            resumen.empleados || 0
                        }
                    </h1>

                </div>

                <div className="card">

                    <h3>
                        💵 Facturación
                    </h3>

                    <h1>

                        $

                        {Number(
                            resumen.facturacion || 0
                        ).toFixed(2)}

                    </h1>

                </div>

            </div>



            <div className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}
                >
                    <h2>📊 Historial de Ingresos Mensuales</h2>
                    <button
                        className="btn-green"
                        onClick={descargarPDF}
                    >
                        Descargar PDF
                    </button>
                </div>

                <div style={{ padding: "20px 10px", display: "flex", flexDirection: "column", alignItems: "center", background: "#fafbfc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    {(() => {
                        const datosMes = obtenerIngresosPorMes();
                        if (datosMes.length === 0) {
                            return <p style={{ color: "#64748b" }}>No hay suficientes datos de facturación para generar el gráfico.</p>;
                        }
                        const maxVal = Math.max(...datosMes.map(d => d.total));
                        const chartHeight = 200;
                        const chartWidth = 500;
                        const paddingLeft = 60;
                        const paddingBottom = 30;
                        const graphWidth = chartWidth - paddingLeft;
                        const graphHeight = chartHeight - paddingBottom;
                        
                        return (
                            <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ maxWidth: "600px" }}>
                                {/* Grid lines & Y Axis */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                    const y = graphHeight - (ratio * graphHeight);
                                    const value = ratio * maxVal;
                                    return (
                                        <g key={index}>
                                            <line x1={paddingLeft} y1={y} x2={chartWidth} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                                            <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="600">
                                                ${value.toFixed(0)}
                                            </text>
                                        </g>
                                    );
                                })}
                                
                                {/* Bars */}
                                {datosMes.map((d, i) => {
                                    const barWidth = 35;
                                    const spacing = (graphWidth / datosMes.length);
                                    const x = paddingLeft + (i * spacing) + (spacing - barWidth) / 2;
                                    const barHeight = maxVal > 0 ? (d.total / maxVal) * graphHeight : 0;
                                    const y = graphHeight - barHeight;
                                    
                                    return (
                                        <g key={i}>
                                            <defs>
                                                <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#059669" />
                                                </linearGradient>
                                            </defs>
                                            <rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={barHeight}
                                                fill={`url(#grad-${i})`}
                                                rx="4"
                                            />
                                            <text
                                                x={x + barWidth / 2}
                                                y={y - 6}
                                                textAnchor="middle"
                                                fill="#1e293b"
                                                fontSize="11"
                                                fontWeight="bold"
                                            >
                                                ${d.total.toFixed(0)}
                                            </text>
                                            <text
                                                x={x + barWidth / 2}
                                                y={graphHeight + 18}
                                                textAnchor="middle"
                                                fill="#64748b"
                                                fontSize="11"
                                                fontWeight="500"
                                            >
                                                {d.mes}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        );
                    })()}
                </div>
            </div>



            <div className="card">

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                    <h2 style={{ margin: 0 }}>
                        Materiales Más Utilizados
                    </h2>
                    <button
                        className="btn-green"
                        onClick={descargarMaterialesPDF}
                        style={{
                            backgroundColor: "var(--verde-secundario)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "600",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "13px"
                        }}
                    >
                        📦 Descargar PDF Materiales
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
                    <div className="table-card" style={{ margin: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tablero</th>
                                    <th>Veces usado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiales.map(m => (
                                    <tr key={m.nombre}>
                                        <td>{m.nombre}</td>
                                        <td>{m.veces}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-card" style={{ margin: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Accesorio</th>
                                    <th>Veces usado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accesorios.map(a => (
                                    <tr key={a.nombre}>
                                        <td>{a.nombre}</td>
                                        <td>{a.veces}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>



            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <h2 style={{ margin: 0 }}>📊 Distribución de Trabajos por Estado</h2>
                    <button
                        className="btn-green"
                        onClick={descargarTrabajosPDF}
                        style={{
                            backgroundColor: "#3b7f4a",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "600",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "13px"
                        }}
                    >
                        🛠️ Descargar PDF Trabajos
                    </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                    {(() => {
                        const datosEstado = obtenerTrabajosPorEstado();
                        const totalTrabajos = datosEstado.reduce((acc, d) => acc + d.cantidad, 0);
                        if (totalTrabajos === 0) {
                            return <p style={{ color: "#64748b" }}>No hay trabajos registrados para generar el gráfico.</p>;
                        }
                        
                        let acumulado = 0;
                        const r = 40;
                        const circ = 2 * Math.PI * r;
                        const coloresEstado = {
                            COMPLETADO: "#10b981",
                            EN_PROCESO: "#3b82f6",
                            PENDIENTE: "#f59e0b"
                        };
                        
                        return (
                            <>
                                <div style={{ position: "relative", width: "160px", height: "160px" }}>
                                    <svg width="160" height="160" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                        <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                                        {datosEstado.map((d) => {
                                            const pct = d.cantidad / totalTrabajos;
                                            const dashArray = `${pct * circ} ${circ}`;
                                            const dashOffset = -acumulado;
                                            acumulado += pct * circ;
                                            return (
                                                <circle
                                                    key={d.estado}
                                                    cx="50"
                                                    cy="50"
                                                    r={r}
                                                    fill="transparent"
                                                    stroke={coloresEstado[d.estado] || "#94a3b8"}
                                                    strokeWidth="12"
                                                    strokeDasharray={dashArray}
                                                    strokeDashoffset={dashOffset}
                                                    strokeLinecap="round"
                                                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        textAlign: "center"
                                    }}>
                                        <span style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", display: "block", lineHeight: "1" }}>
                                            {totalTrabajos}
                                        </span>
                                        <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                                            Total
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "200px" }}>
                                    {datosEstado.map((d) => {
                                        const pct = totalTrabajos > 0 ? (d.cantidad / totalTrabajos) * 100 : 0;
                                        return (
                                            <div key={d.estado} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        width: "12px",
                                                        height: "12px",
                                                        borderRadius: "50%",
                                                        backgroundColor: coloresEstado[d.estado] || "#94a3b8",
                                                        display: "inline-block"
                                                    }} />
                                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                                                        {d.estado}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>
                                                    {d.cantidad} ({pct.toFixed(0)}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Modal de Alerta Personalizada */}
            {alertaModal.visible && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999
                }}>
                    <div className="card" style={{
                        width: "380px",
                        padding: "25px",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "40px", margin: "0 auto" }}>
                            {alertaModal.tipo === "success" ? "✔️" : alertaModal.tipo === "error" ? "❌" : "⚠️"}
                        </div>
                        
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
                            {alertaModal.titulo}
                        </h3>
                        
                        <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                            {alertaModal.mensaje}
                        </p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                            <button 
                                className="btn-green" 
                                onClick={() => setAlertaModal({ ...alertaModal, visible: false })}
                                style={{ padding: "8px 24px", cursor: "pointer", borderRadius: "6px", fontWeight: "bold", backgroundColor: "var(--verde-principal)", color: "white", border: "none" }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
