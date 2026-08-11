import "../css/trabajos.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ActionMenu from "../components/ActionMenu";
import { crearTrabajo } from "../services/cotizacionService";

export default function Cotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [buscar, setBuscar] = useState("");
  
  // Estado para eliminar cotización
  const [cotizacionParaEliminar, setCotizacionParaEliminar] = useState(null);

  // Estados para el Modal de inicio de trabajo
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [prioridad, setPrioridad] = useState("MEDIA");

  // Estado para el modal de detalle
  const [detalleCotizacion, setDetalleCotizacion] = useState(null);
  const [enviandoCorreo, setEnviandoCorreo] = useState(null); // id de la cotización que se está enviando

  const [alertaModal, setAlertaModal] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    tipo: "warning"
  });

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    onConfirm: null
  });

  const mostrarAlerta = (mensaje, titulo = "Atención", tipo = "warning") => {
    setAlertaModal({
      visible: true,
      titulo,
      mensaje,
      tipo
    });
  };

  const mostrarConfirmacion = (mensaje, onConfirm, titulo = "Confirmar acción") => {
    setConfirmModal({
      visible: true,
      titulo,
      mensaje,
      onConfirm
    });
  };

  useEffect(() => {
    cargar();
  }, []);

  const trabajosFiltrados = cotizaciones.filter(c => {
    const busqueda = buscar.toLowerCase();
    return (
      String(c.id_cotizacion).toLowerCase().includes(busqueda) ||
      String(c.cliente || "").toLowerCase().includes(busqueda) ||
      String(c.tipo_mueble || "").toLowerCase().includes(busqueda) ||
      String(c.total_final || "").toLowerCase().includes(busqueda) ||
      String(c.estado || "").toLowerCase().includes(busqueda)
    );
  });

  const cargar = async () => {
    try {
      const res = await api.get("/trabajos-disponibles");
      setCotizaciones(res.data);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await api.get(`/cotizacion-detalle/${id}`);
      setDetalleCotizacion(res.data);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      mostrarAlerta("Error al cargar el detalle de la cotización.", "Error", "error");
    }
  };

  const editarCotizacion = async (c) => {
    try {
      const res = await api.get(`/cotizacion-detalle/${c.id_cotizacion}`);
      navigate("/nueva-cotizacion", { state: { cotizacionEditar: res.data } });
    } catch (error) {
      console.error("Error al cargar cotización para edición:", error);
      mostrarAlerta("Error al cargar los datos de la cotización.", "Error", "error");
    }
  };

  const confirmarEliminacionCotizacion = async () => {
    if (!cotizacionParaEliminar) return;
    try {
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;

      await api.delete(`/cotizacion/${cotizacionParaEliminar.id_cotizacion}`, {
        data: { id_usuario }
      });
      setCotizacionParaEliminar(null);
      mostrarAlerta("Cotización eliminada correctamente.", "Éxito", "success");
      cargar();
    } catch (error) {
      console.error("Error al eliminar la cotización:", error);
      mostrarAlerta("No se pudo eliminar la cotización.", "Error", "error");
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

  const enviarCorreo = async (c) => {
    if (!c.id_cotizacion) return;
    setEnviandoCorreo(c.id_cotizacion);
    try {
      // 1. Obtener detalles de la cotización
      const resDetail = await api.get(`/cotizacion-detalle/${c.id_cotizacion}`);
      const data = resDetail.data;
      
      // 2. Generar diagrama de cortes
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
        
        const { dibujar } = await import("../utils/dibujar");
        dibujar({ current: canvas }, piezasFormateadas, tableroColor);
        base64Image = canvas.toDataURL("image/png");
      }
      
      // 3. Generar PDF en memoria
      const { generarPDFCotizacion } = await import("../utils/pdfGenerator");
      const doc = generarPDFCotizacion(data, base64Image, false);
      const pdfBase64 = doc.output("base64");
      
      // 4. Enviar correo con el PDF adjunto
      const res = await api.post(`/enviar-cotizacion-correo/${c.id_cotizacion}`, {
        pdfBase64
      });
      
      if (res.data.previewUrl) {
        // En ambiente de desarrollo local usando cuenta test de ethereal
        mostrarConfirmacion(
          `¡Cotización enviada con éxito por correo!\n\nDestinatario: ${c.cliente}\n\n¿Desea abrir la previsualización del correo enviado en su navegador?`,
          () => {
            window.open(res.data.previewUrl, "_blank");
          },
          "Correo Enviado"
        );
      } else {
        mostrarAlerta("¡Cotización enviada con éxito al cliente por correo!", "Éxito", "success");
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      const msg = error.response?.data?.mensaje || "Error al enviar el correo de cotización.";
      const det = error.response?.data?.detalle ? `\n\nDetalle: ${error.response.data.detalle}` : "";
      mostrarAlerta(`${msg}${det}`, "Error al enviar correo", "error");
    } finally {
      setEnviandoCorreo(null);
    }
  };

  // Abre el modal interactivo de inicio en lugar de usar prompt()
  const abrirModalIniciar = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setPrioridad("MEDIA");
  };

  // Confirma el inicio del trabajo desde el modal
  const confirmarIniciarTrabajo = async () => {
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      await crearTrabajo({
        id_cotizacion: cotizacionSeleccionada.id_cotizacion,
        fecha_estimada: null, // No se requiere fecha estimada
        prioridad: prioridad,
        id_usuario // Se envía para auditar quién creó el trabajo
      });
      mostrarAlerta("Trabajo creado correctamente", "Éxito", "success");
      setCotizacionSeleccionada(null); // Cerrar el modal
      cargar(); // Recargar la tabla
    } catch (error) {
      console.error(error);
      mostrarAlerta("Error al crear el trabajo.", "Error", "error");
    }
  };
  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">🛠️</div>
          <div>
            <h1>Cotizaciones</h1>
            <p>Historial y gestión de cotizaciones del sistema</p>
          </div>
        </div>
      </div>
      {cotizaciones.length === 0 && (
        <div className="card">
          <h3>No existen cotizaciones registradas</h3>
        </div>
      )}
      {cotizaciones.length > 0 && (
        <div className="table-card">
          <div className="table-header">
            <h3>Lista de Cotizaciones</h3>
            <div className="table-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar cotización..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
          </div>
          <table>
                <thead>
                  <tr>
                    <th>Cotización</th>
                    <th>Cliente</th>
                    <th>Mueble</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                        No se encontraron cotizaciones con el criterio de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    trabajosFiltrados.map(c => (
                      <tr key={c.id_cotizacion}>
                        <td>#{c.id_cotizacion}</td>
                        <td>{c.cliente}</td>
                        <td>{c.tipo_mueble}</td>
                        <td>{new Date(c.fecha).toLocaleDateString()}</td>
                        <td>${Number(c.total_final).toFixed(2)}</td>
                        <td>
                          <span className={`estado-badge estado-${c.estado?.toLowerCase() || 'pendiente'}`} style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            fontSize: "12px",
                            backgroundColor: c.estado === "APROBADA" ? "#d1fae5" : c.estado === "RECHAZADA" ? "#fee2e2" : "#fef3c7",
                            color: c.estado === "APROBADA" ? "#059669" : c.estado === "RECHAZADA" ? "#dc2626" : "#d97706"
                          }}>
                            {c.estado || "PENDIENTE"}
                          </span>
                        </td>
                        <td>
                          <ActionMenu>
                            {(close) => (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { close(); verDetalle(c.id_cotizacion); }}
                                  style={{
                                    width: "100%",
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <span style={{ fontSize: "14px" }}>👁️</span> Detalle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { close(); editarCotizacion(c); }}
                                  style={{
                                    width: "100%",
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#2563eb",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <span style={{ fontSize: "14px" }}>✏️</span> Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { close(); descargarCotizacionPDF(c); }}
                                  style={{
                                    width: "100%",
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <span style={{ fontSize: "14px" }}>📄</span> PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { close(); enviarCorreo(c); }}
                                  disabled={enviandoCorreo === c.id_cotizacion}
                                  style={{
                                    width: "100%",
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    opacity: enviandoCorreo === c.id_cotizacion ? 0.6 : 1
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <span style={{ fontSize: "14px" }}>📧</span> {enviandoCorreo === c.id_cotizacion ? "Enviando..." : "Correo"}
                                </button>
                                {c.estado === 'PENDIENTE' && (
                                  <button
                                    type="button"
                                    onClick={() => { close(); abrirModalIniciar(c); }}
                                    style={{
                                      width: "100%",
                                      padding: "9px 14px",
                                      textAlign: "left",
                                      background: "none",
                                      border: "none",
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      color: "#059669",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      cursor: "pointer"
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ecfdf5")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                  >
                                    <span style={{ fontSize: "14px" }}>🔨</span> Iniciar trabajo
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => { close(); setCotizacionParaEliminar(c); }}
                                  style={{
                                    width: "100%",
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#dc2626",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <span style={{ fontSize: "14px" }}>🗑️</span> Eliminar
                                </button>
                              </>
                            )}
                          </ActionMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
      )}

      {/* Modal de Detalle de Cotización */}
      {detalleCotizacion && (
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
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: "600px",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
                Detalle de Cotización #{detalleCotizacion.cotizacion?.id_cotizacion}
              </h3>
              <button 
                onClick={() => setDetalleCotizacion(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#94a3b8"
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "14px", color: "#475569" }}>
              <div>Cliente: <strong>{detalleCotizacion.cotizacion?.cliente}</strong></div>
              <div>Mueble: <strong>{detalleCotizacion.cotizacion?.tipo_mueble}</strong></div>
              <div>Fecha: <strong>{new Date(detalleCotizacion.cotizacion?.fecha).toLocaleDateString()}</strong></div>
              <div>Total Final: <strong style={{ color: "#24833c" }}>${Number(detalleCotizacion.cotizacion?.total_final).toFixed(2)}</strong></div>
            </div>

            <div style={{ fontSize: "14px" }}>
              <h4 style={{ margin: "10px 0 6px 0", fontWeight: "bold" }}>Desglose de Costos</h4>
              <ul style={{ paddingLeft: "20px", margin: 0, color: "#475569" }}>
                <li>Materiales (Tableros): ${Number(detalleCotizacion.cotizacion?.total_tableros).toFixed(2)}</li>
                <li>Accesorios: ${Number(detalleCotizacion.cotizacion?.total_accesorios).toFixed(2)}</li>
                <li>Mano de obra: ${Number(detalleCotizacion.cotizacion?.mano_obra).toFixed(2)}</li>
                <li>Transporte: ${Number(detalleCotizacion.cotizacion?.transporte).toFixed(2)}</li>
              </ul>
            </div>

            {detalleCotizacion.piezas && detalleCotizacion.piezas.length > 0 && (
              <div>
                <h4 style={{ margin: "10px 0 6px 0", fontWeight: "bold" }}>Piezas del Mueble</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "6px" }}>Pieza</th>
                      <th style={{ padding: "6px" }}>Medidas</th>
                      <th style={{ padding: "6px" }}>Cantidad</th>
                      <th style={{ padding: "6px" }}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleCotizacion.piezas.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "6px" }}>{p.pieza_nombre}</td>
                        <td style={{ padding: "6px" }}>{p.ancho} x {p.alto} cm</td>
                        <td style={{ padding: "6px" }}>{p.cantidad}</td>
                        <td style={{ padding: "6px" }}>${Number(p.costo).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detalleCotizacion.accesorios && detalleCotizacion.accesorios.length > 0 && (
              <div>
                <h4 style={{ margin: "10px 0 6px 0", fontWeight: "bold" }}>Accesorios y Herrajes</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "6px" }}>Accesorio</th>
                      <th style={{ padding: "6px" }}>Cantidad</th>
                      <th style={{ padding: "6px" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleCotizacion.accesorios.map((acc, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "6px" }}>{acc.accesorio_nombre}</td>
                        <td style={{ padding: "6px" }}>{acc.cantidad}</td>
                        <td style={{ padding: "6px" }}>${Number(acc.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button 
                className="btn-light" 
                onClick={() => setDetalleCotizacion(null)}
                style={{ padding: "8px 20px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de React para Iniciar Trabajo (Reemplazo del Prompt) */}
      {cotizacionSeleccionada && (
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
          zIndex: 1000
        }}>
          <div className="card" style={{
            width: "400px",
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
                Iniciar Trabajo #{cotizacionSeleccionada.id_cotizacion}
              </h3>
              <button 
                onClick={() => setCotizacionSeleccionada(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#94a3b8"
                }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "14px", color: "#475569" }}>
              <div style={{ marginBottom: "4px" }}>
                Cliente: <strong>{cotizacionSeleccionada.cliente}</strong>
              </div>
              <div>
                Mueble: <strong>{cotizacionSeleccionada.tipo_mueble}</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                Prioridad del trabajo
              </label>
              <select 
                value={prioridad} 
                onChange={(e) => setPrioridad(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  backgroundColor: "white",
                  outline: "none"
                }}
              >
                <option value="BAJA">BAJA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="ALTA">ALTA</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" }}>
              <button 
                className="btn-light" 
                onClick={() => setCotizacionSeleccionada(null)}
                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-green" 
                onClick={confirmarIniciarTrabajo}
                style={{ padding: "8px 20px", cursor: "pointer", borderRadius: "6px" }}
              >
                Iniciar Trabajo
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Confirmación Personalizada */}
      {confirmModal.visible && (
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
            <div style={{ fontSize: "40px", margin: "0 auto" }}>⚠️</div>
            
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
              {confirmModal.titulo}
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              {confirmModal.mensaje}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setConfirmModal({ ...confirmModal, visible: false })}
                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete" 
                onClick={() => {
                  setConfirmModal({ ...confirmModal, visible: false });
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                }}
                style={{ 
                  padding: "8px 20px", 
                  cursor: "pointer", 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  fontWeight: "bold", 
                  borderRadius: "6px",
                  border: "none"
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación para eliminar cotización */}
      {cotizacionParaEliminar && (
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
          zIndex: 1000
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
            <div style={{ fontSize: "40px", margin: "0 auto" }}>⚠️</div>
            
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
              ¿Eliminar Cotización?
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              ¿Está seguro que desea eliminar la <strong>Cotización #{cotizacionParaEliminar.id_cotizacion}</strong> de <strong>{cotizacionParaEliminar.cliente}</strong>?<br />
              <span style={{ fontSize: "12px", color: "#ef4444" }}>Esta acción no se puede deshacer.</span>
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setCotizacionParaEliminar(null)}
                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete" 
                onClick={confirmarEliminacionCotizacion}
                style={{ 
                  padding: "8px 20px", 
                  cursor: "pointer", 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  fontWeight: "bold", 
                  borderRadius: "6px",
                  border: "none"
                }}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
