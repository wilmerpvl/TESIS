import { useEffect, useState, useRef } from "react";
import TipoMueble from "../components/cotizacion/TipoMueble";
import ModalTableros from "../components/cotizacion/ModalTableros";
import Modulos from "../components/cotizacion/Modulos";
import Accesorios from "../components/cotizacion/Accesorios";
import PreviewCanvas from "../components/cotizacion/PreviewCanvas";
import SelectorCliente from "../components/cotizacion/SelectorCliente";
import ModalResultadoCotizacion from "../components/cotizacion/ModalResultadoCotizacion";
import {
    obtenerTiposMueble,
    obtenerTableros,
    obtenerAccesorios,
    obtenerClientes,
    guardarCotizacion
} from "../services/cotizacionService";
import { dibujar } from "../utils/dibujar";
export default function Cotizacion() {
    const canvasRef = useRef(null);
    const [tipos, setTipos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [tableros, setTableros] = useState([]);
    const [accesoriosDisponibles, setAccesoriosDisponibles] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");
    const [tableroSeleccionado, setTableroSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modulos, setModulos] = useState([]);
    const [accesorios, setAccesorios] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [manoObra, setManoObra] = useState(0);
    const [transporte, setTransporte] = useState(0);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const [imagenCorte, setImagenCorte] = useState("");
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
    // =====================================
    // CARGA INICIAL
    // =====================================
    useEffect(() => {
        cargarDatos();
    }, []);
    const cargarDatos = async () => {
        try {
            const clientesData = await obtenerClientes();
            const tiposData = await obtenerTiposMueble();
            const tablerosData = await obtenerTableros();
            const accesoriosData = await obtenerAccesorios();
            setClientes(Array.isArray(clientesData) ? clientesData : []);
            setTipos(Array.isArray(tiposData) ? tiposData : []);
            setTableros(Array.isArray(tablerosData) ? tablerosData : []);
            setAccesoriosDisponibles(Array.isArray(accesoriosData) ? accesoriosData : []);
        } catch (error) {
            console.error(error);
        }
    };
    // =====================================
    // DIBUJAR
    // =====================================
    useEffect(() => {
        let piezas = [];
        modulos.forEach(modulo => {
            modulo.piezas.forEach(p => {
                piezas.push({
                    nombre: p.nombre,
                    ancho: p.ancho,
                    alto: p.alto,
                    cantidad: p.cantidad || 1
                });
            });
        });
        dibujar(canvasRef, piezas, tableroSeleccionado?.color);
    }, [modulos]);
    // =====================================
    // CALCULAR
    // =====================================
    const calcularCotizacion = () => {
        if (!tableroSeleccionado) {
            mostrarAlerta("Seleccione un tablero", "Validación");
            return;
        }
        let piezas = [];
        modulos.forEach(modulo => {
            modulo.piezas.forEach(p => {
                piezas.push({
                    ...p,
                    moduloNombre: modulo.nombre
                });
            });
        });
        const dibujo = dibujar(
            canvasRef,
            piezas,
            tableroSeleccionado?.color
        );
        const imagenCanvas = canvasRef.current.toDataURL("image/png");
        setImagenCorte(imagenCanvas);
        let totalCortes = 0;
        let areaTotal = 0;
        piezas.forEach(p => {
            const ancho = parseFloat(p.ancho) || 0;
            const alto = parseFloat(p.alto) || 0;
            const cantidad = parseInt(p.cantidad) || 1;
            areaTotal += ancho * alto * cantidad;
            totalCortes += cantidad * parseFloat(tableroSeleccionado.costo_corte);
        });
        const totalTableros =
            dibujo.totalTablones *
            parseFloat(tableroSeleccionado.precio_tablero);
        let totalAccesorios = 0;
        accesorios.forEach(item => {
            const acc = accesoriosDisponibles.find(
                a => a.id_accesorio === parseInt(item.id_accesorio)
            );
            if (acc) {
                totalAccesorios +=
                    parseFloat(acc.precio_unitario) *
                    parseInt(item.cantidad);
            }
        });
        const subtotal = totalTableros + totalCortes + totalAccesorios;
        const manoObraValor = parseFloat(manoObra || 0);
        const transporteValor = parseFloat(transporte || 0);
        const totalFinal = subtotal + manoObraValor + transporteValor;
        setResultado({
            tablones: dibujo.totalTablones,
            detalleTablones: dibujo.tablones,
            imagen: imagenCanvas,
            area: areaTotal,
            totalTableros,
            totalCortes,
            totalAccesorios,
            manoObra: manoObraValor,
            transporte: transporteValor,
            totalFinal
        });
        setMostrarResultado(true);
    };
    // =====================================
    // Guardar Cotizacion
    // =====================================
    const guardarCotizacionBD = async () => {
        try {
            const detalles = [];
            modulos.forEach(modulo => {
                modulo.piezas.forEach(pieza => {
                    detalles.push({
                        id_modulo: modulo.id_modulo,
                        id_pieza: pieza.id_pieza,
                        id_tablero: tableroSeleccionado.id_tablero,
                        ancho: parseFloat(pieza.ancho) || 0,
                        alto: parseFloat(pieza.alto) || 0,
                        cantidad: parseInt(pieza.cantidad) || 1,
                        costo: 0,
                        observacion: ""
                    });
                });
            });
            const accesoriosGuardar = accesorios.map(acc => {
                const accesorio = accesoriosDisponibles.find(
                    a => a.id_accesorio == acc.id_accesorio
                );
                return {
                    id_accesorio: acc.id_accesorio,
                    cantidad: acc.cantidad,
                    subtotal: (accesorio?.precio_unitario || 0) * (parseInt(acc.cantidad) || 0)
                };
            });
            // Obtener el ID del usuario logueado desde localStorage
            const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
            const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
            const payload = {
                id_cliente: clienteSeleccionado.id_cliente,
                id_tipo: tipoSeleccionado,
                total_tableros: resultado.totalTableros,
                total_accesorios: resultado.totalAccesorios,
                mano_obra: resultado.manoObra,
                transporte: resultado.transporte,
                total_final: resultado.totalFinal,
                detalles,
                accesorios: accesoriosGuardar,
                id_usuario // Se envía para registrar en auditoría
            };
            const data = await guardarCotizacion(payload);
            mostrarAlerta(data.mensaje || data.message || "Cotización guardada correctamente.", "Éxito", "success");
            setMostrarResultado(false);
        } catch (error) {
            console.error(error);
            mostrarAlerta("Error al guardar la cotización", "Error", "error");
        }
    };
    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <div className="icon-box">📄</div>
                    <div>
                        <h1>Nueva Cotización</h1>
                        <p>Generar cotización personalizada</p>
                    </div>
                </div>
            </div>
            {/* FORMULARIO UNIFICADO DE COTIZACIÓN */}
            <div className="card cotizacion-master-card" style={{ padding: "30px", marginBottom: "30px" }}>
                <TipoMueble
                    tipos={tipos}
                    tipoSeleccionado={tipoSeleccionado}
                    onChange={setTipoSeleccionado}
                    setModulos={setModulos}
                />
                <SelectorCliente
                    clientes={clientes}
                    clienteSeleccionado={clienteSeleccionado}
                    setClienteSeleccionado={setClienteSeleccionado}
                />
                <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                    <div className="partes-header" style={{ marginBottom: "8px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b", fontWeight: "700" }}>3. Tablero General</h3>
                            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                                {tableroSeleccionado
                                    ? `✓ Tablero seleccionado: ${tableroSeleccionado.nombre}`
                                    : "Ningún tablero seleccionado"}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-green"
                            onClick={() => setMostrarModal(true)}
                        >
                            Buscar Tablero
                        </button>
                    </div>
                </div>
                <ModalTableros
                    visible={mostrarModal}
                    onCerrar={() => setMostrarModal(false)}
                    tableros={tableros}
                    onSeleccionar={(tablero) => {
                        setTableroSeleccionado(tablero);
                        setMostrarModal(false);
                    }}
                />
                <Modulos
                    tipoSeleccionado={tipoSeleccionado}
                    modulos={modulos}
                    setModulos={setModulos}
                />
                <Accesorios
                    accesoriosDisponibles={accesoriosDisponibles}
                    accesorios={accesorios}
                    setAccesorios={setAccesorios}
                />
                <PreviewCanvas canvasRef={canvasRef} />
                <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "16px", color: "#1e293b", fontWeight: "700", marginBottom: "12px" }}>7. Costos Adicionales</h3>
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569", display: "block", marginBottom: "8px" }}>Mano de obra ($)</label>
                            <input
                                type="number"
                                value={manoObra}
                                onChange={(e) => setManoObra(e.target.value)}
                                placeholder="0.00"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px 16px", 
                                    border: "1px solid #cbd5e1", 
                                    borderRadius: "8px", 
                                    fontSize: "15px",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569", display: "block", marginBottom: "8px" }}>Transporte ($)</label>
                            <input
                                type="number"
                                value={transporte}
                                onChange={(e) => setTransporte(e.target.value)}
                                placeholder="0.00"
                                style={{ 
                                    width: "100%", 
                                    padding: "12px 16px", 
                                    border: "1px solid #cbd5e1", 
                                    borderRadius: "8px", 
                                    fontSize: "15px",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                    <button
                        type="button"
                        className="btn-green"
                        onClick={calcularCotizacion}
                        style={{ padding: "14px 35px", fontSize: "16px", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        🧮 Calcular Cotización
                    </button>
                </div>
            </div>
            <ModalResultadoCotizacion
                visible={mostrarResultado}
                onCerrar={() => setMostrarResultado(false)}
                resultado={resultado}
                cliente={clienteSeleccionado}
                tablero={tableroSeleccionado}
                tipoMueble={tipos.find(t => t.id_tipo == tipoSeleccionado)}
                accesorios={accesorios}
                accesoriosDisponibles={accesoriosDisponibles}
                onGuardar={guardarCotizacionBD}
            />
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
