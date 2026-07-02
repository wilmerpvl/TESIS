import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reportes() {


    const [resumen, setResumen] =
        useState({});

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

    const obtenerTokenHeaders = () => {
        const usuarioStr = localStorage.getItem("usuario");
        let token = "";
        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);
                token = usuario?.token;
            } catch (e) {}
        }
        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    };

    const cargarDatos = async () => {
        try {
            const headers = obtenerTokenHeaders();
            // Ejecución en paralelo de todas las llamadas de reportes (Promise.all)
            const [resumenRes, materialesRes, trabajosRes, cotizacionesRes, accesoriosRes] = await Promise.all([
                fetch("http://localhost:3000/api/reportes/resumen", { headers }),
                fetch("http://localhost:3000/api/reportes/materiales", { headers }),
                fetch("http://localhost:3000/api/reportes/trabajos", { headers }),
                fetch("http://localhost:3000/api/reportes/cotizaciones", { headers }),
                fetch("http://localhost:3000/api/reportes/accesorios", { headers })
            ]);

            const [resumenData, materialesData, trabajosData, cotizacionesData, accesoriosData] = await Promise.all([
                resumenRes.json(),
                materialesRes.json(),
                trabajosRes.json(),
                cotizacionesRes.json(),
                accesoriosRes.json()
            ]);

            setResumen(resumenData);
            setMateriales(materialesData);
            setTrabajos(trabajosData);
            setCotizaciones(cotizacionesData);
            setAccesorios(accesoriosData);
        }
        catch (error) {
            console.error("Error al cargar los reportes:", error);
        }
    };

    const descargarCotizacionPDF = async (c) => {
        try {
            const headers = obtenerTokenHeaders();
            const res = await fetch(`http://localhost:3000/api/cotizacion-detalle/${c.id_cotizacion}`, { headers });
            const data = await res.json();
            
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
            alert("Error al generar el reporte en PDF.");
        }
    };

    const descargarPDF = () => {

        const doc =
            new jsPDF();

        doc.setFontSize(18);

        doc.text(
            "Reporte de Cotizaciones",
            14,
            15
        );

        autoTable(doc, {

            startY: 25,

            head: [[
                "ID",
                "Cliente",
                "Mueble",
                "Fecha",
                "Total",
                "Estado"
            ]],

            body:
                cotizaciones.map(c => [

                    c.id_cotizacion,

                    c.cliente,

                    c.tipo_mueble,

                    c.fecha,

                    `$${Number(
                        c.total_final
                    ).toFixed(2)}`,

                    c.estado

                ])

        });

        doc.save(
            "reporte-cotizaciones.pdf"
        );

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
        
        const columnas = ["Trabajo #", "Cliente", "Estado", "Avance (%)"];
        const filas = trabajos.map(t => [
            `#${t.id_trabajo}`,
            t.cliente,
            t.estado,
            `${t.avance}%`
        ]);
        
        autoTable(doc, {
            startY: 32,
            head: [columnas],
            body: filas,
            theme: "striped",
            headStyles: { fillColor: [59, 127, 74] },
            styles: { fontSize: 9 }
        });
        
        doc.save("reporte-estado-trabajos.pdf");
    };



    const cotizacionesFiltradas = cotizaciones.filter(c => {
        const busqueda = buscarCotizacion.toLowerCase();
        return (
            String(c.id_cotizacion).toLowerCase().includes(busqueda) ||
            String(c.cliente || "").toLowerCase().includes(busqueda) ||
            String(c.tipo_mueble || "").toLowerCase().includes(busqueda) ||
            String(c.total_final || "").toLowerCase().includes(busqueda) ||
            String(c.estado || "").toLowerCase().includes(busqueda) ||
            String(c.fecha || "").toLowerCase().includes(busqueda)
        );
    });

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
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        marginBottom:
                            "15px",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}
                >

                    <h2>
                        Reporte de Cotizaciones
                    </h2>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, maxWidth: "400px" }}>
                        <input
                            type="text"
                            placeholder="Buscar cotización..."
                            value={buscarCotizacion}
                            onChange={(e) => setBuscarCotizacion(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                outline: "none",
                                fontSize: "14px",
                                transition: "border-color 0.2s"
                            }}
                        />
                    </div>

                    <button
                        className="btn-green"
                        onClick={
                            descargarPDF
                        }
                    >

                        Descargar PDF

                    </button>

                </div>

                <div className="table-card">

                    <table>

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Cliente</th>

                                <th>Mueble</th>

                                <th>Fecha</th>

                                <th>Total</th>

                                <th>Estado</th>

                                <th>PDF</th>

                            </tr>

                        </thead>

                        <tbody>

                            {cotizacionesFiltradas.map(c => (

                                <tr
                                    key={
                                        c.id_cotizacion
                                    }
                                >

                                    <td>
                                        #
                                        {
                                            c.id_cotizacion
                                        }
                                    </td>

                                    <td>
                                        {c.cliente}
                                    </td>

                                    <td>
                                        {
                                            c.tipo_mueble
                                        }
                                    </td>

                                    <td>
                                        {c.fecha}
                                    </td>

                                    <td>

                                        $

                                        {Number(
                                            c.total_final
                                        ).toFixed(2)}

                                    </td>

                                    <td>
                                        {c.estado}
                                    </td>

                                    <td>

                                        <button
                                            className="btn-green"
                                            onClick={() =>
                                                descargarCotizacionPDF(c)
                                            }
                                        >

                                            PDF

                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                    <h2 style={{ margin: 0 }}>
                        Estado de Trabajos
                    </h2>
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

                <div className="table-card">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Trabajo
                                </th>

                                <th>
                                    Cliente
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Avance
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {trabajos.map(t => (

                                <tr
                                    key={t.id_trabajo}
                                >

                                    <td>
                                        #
                                        {t.id_trabajo}
                                    </td>

                                    <td>
                                        {t.cliente}
                                    </td>

                                    <td>
                                        {t.estado}
                                    </td>

                                    <td>
                                        {t.avance}%
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                </div>

            </div>

        </div>

    );


}
