import React from "react";
import { generarPDFCotizacion } from "../../utils/pdfGenerator";

function ModalResultadoCotizacion({
    visible,
    onCerrar,
    onGuardar,
    resultado,
    cliente,
    tablero,
    tipoMueble,
    accesorios = [],
    accesoriosDisponibles = []
}) {
    if (!visible || !resultado)
        return null;

    const handleDescargarPDF = () => {
        // Formatear cabecera de cotización
        const cotizacion = {
            id_cotizacion: "Borrador",
            cliente: cliente?.nombre || "Consumidor Final",
            cliente_correo: cliente?.correo || "",
            cliente_telefono: cliente?.telefono || "",
            tipo_mueble: tipoMueble?.nombre || "Mueble Personalizado",
            total_tableros: resultado.totalTableros,
            total_accesorios: resultado.totalAccesorios,
            mano_obra: resultado.manoObra,
            transporte: resultado.transporte,
            total_final: resultado.totalFinal,
            fecha: new Date()
        };

        // Formatear piezas para la tabla del PDF
        const piezas = [];
        resultado.detalleTablones.forEach((tablon, tIdx) => {
            tablon.piezas.forEach(pieza => {
                piezas.push({
                    modulo_nombre: pieza.moduloNombre || `Tablón ${tIdx + 1}`,
                    pieza_nombre: pieza.nombre,
                    ancho: parseFloat(pieza.w),
                    alto: parseFloat(pieza.h),
                    cantidad: 1,
                    tablero_nombre: tablero?.nombre || "Tablero"
                });
            });
        });

        // Formatear accesorios para la tabla del PDF
        const accesoriosDetalle = accesorios.map(item => {
            const acc = accesoriosDisponibles.find(
                a => a.id_accesorio === parseInt(item.id_accesorio)
            );
            return {
                accesorio_nombre: acc ? acc.nombre : "Accesorio",
                precio_unitario: acc ? parseFloat(acc.precio_unitario) : 0,
                cantidad: parseInt(item.cantidad) || 0,
                subtotal: acc ? parseFloat(acc.precio_unitario) * (parseInt(item.cantidad) || 0) : 0
            };
        }).filter(a => a.cantidad > 0);

        // Generar y descargar el PDF
        generarPDFCotizacion(
            { cotizacion, piezas, accesorios: accesoriosDetalle },
            resultado.imagen
        );
    };

    return (
        <div className="modal-tableros">
            <div
                className="modal-contenido"
                style={{
                    maxWidth: "1000px",
                    width: "95%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
                }}
            >
                <div className="modal-header">
                    <h2>Resumen de Cotización</h2>
                    <button
                        className="btn-delete"
                        onClick={onCerrar}
                    >
                        ✕
                    </button>
                </div>
                <div className="resultado-grid">
                    <div>
                        <strong>Cliente:</strong>
                        <p>{cliente?.nombre || "No seleccionado"}</p>
                    </div>
                    <div>
                        <strong>Tipo:</strong>
                        <p>{tipoMueble?.nombre || ""}</p>
                    </div>
                    <div>
                        <strong>Tablero:</strong>
                        <p>{tablero?.nombre || ""}</p>
                    </div>
                    <div>
                        <strong>Fecha:</strong>
                        <p>{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <hr />
                <div className="resultado-grid">
                    <div className="resultado-item">
                        <span>Tablones</span>
                        <b>{resultado.tablones}</b>
                    </div>
                    <div className="resultado-item">
                        <span>Área</span>
                        <b>{Number(resultado.area).toFixed(2)} m²</b>
                    </div>
                    <div className="resultado-item">
                        <span>Tableros</span>
                        <b>${Number(resultado.totalTableros).toFixed(2)}</b>
                    </div>
                    <div className="resultado-item">
                        <span>Cortes</span>
                        <b>${Number(resultado.totalCortes).toFixed(2)}</b>
                    </div>
                    <div className="resultado-item">
                        <span>Accesorios</span>
                        <b>${Number(resultado.totalAccesorios).toFixed(2)}</b>
                    </div>
                    <div className="resultado-item">
                        <span>Mano Obra</span>
                        <b>${Number(resultado.manoObra).toFixed(2)}</b>
                    </div>
                    <div className="resultado-item">
                        <span>Transporte</span>
                        <b>${Number(resultado.transporte).toFixed(2)}</b>
                    </div>
                </div>
                <hr />
                <h1 className="total-final">
                    TOTAL ${Number(resultado.totalFinal).toFixed(2)}
                </h1>
                <hr />
                <h3>Distribución de Cortes</h3>
                {resultado.imagen && (
                    <img
                        src={resultado.imagen}
                        alt="Corte"
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                            marginTop: "15px"
                        }}
                    />
                )}
                <hr />
                <h3>Distribución de cortes</h3>
                {resultado.detalleTablones?.map((tablon, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            marginTop: "15px"
                        }}
                    >
                        <h4>Tablón {index + 1}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Módulo Procedencia</th>
                                    <th>Pieza</th>
                                    <th>Ancho</th>
                                    <th>Alto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tablon.piezas.map((pieza, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: "600", color: "#4f46e5" }}>
                                            {pieza.moduloNombre || "General / Estructura"}
                                        </td>
                                        <td>{pieza.nombre}</td>
                                        <td>{pieza.w} cm</td>
                                        <td>{pieza.h} cm</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                        marginTop: "20px"
                    }}
                >
                    <button
                        className="btn-delete"
                        onClick={onCerrar}
                    >
                        Cerrar
                    </button>
                    <button
                        className="btn-light"
                        onClick={handleDescargarPDF}
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}
                    >
                        🖨️ Descargar PDF
                    </button>
                    <button
                        className="btn-green"
                        onClick={onGuardar}
                    >
                        Guardar Cotización
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalResultadoCotizacion;
