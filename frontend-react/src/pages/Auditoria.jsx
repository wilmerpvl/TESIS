import { useEffect, useState } from "react";
import api from "../services/api";
// Para exportar a PDF, asegúrate de instalar las librerías:
// npm install jspdf jspdf-autotable
import { jsPDF } from "jspdf";
import "jspdf-autotable";
function Auditoria() {
  const [auditoria, setAuditoria] = useState([]);
  const [alerta, setAlerta] = useState(null);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  useEffect(() => {
    cargarAuditoria();
  }, []);
  const cargarAuditoria = async () => {
    try {
      const res = await api.get("/auditoria");
      setAuditoria(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setAuditoria([]);
    }
  };
  // Obtener lista única de usuarios para el filtro select
  const usuariosUnicos = Array.from(
    new Set(auditoria.map((a) => a.nombre))
  ).filter(Boolean);
  // Filtrar los registros de auditoría localmente
  const registrosFiltrados = auditoria.filter((a) => {
    // 1. Buscador (nombre del usuario, rol o acción)
    const coincideBusqueda =
      (a.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.rol || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.accion || "").toLowerCase().includes(busqueda.toLowerCase());
    // 2. Filtro por usuario específico
    const coincideUsuario =
      usuarioSeleccionado === "" || a.nombre === usuarioSeleccionado;
    // 3. Filtro por rango de fechas
    let coincideFecha = true;
    if (a.fecha) {
      const fechaLog = new Date(a.fecha);
      fechaLog.setHours(0, 0, 0, 0); // Limpiar horas para comparar solo días
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        if (fechaLog < inicio) coincideFecha = false;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (fechaLog > fin) coincideFecha = false;
      }
    }
    return coincideBusqueda && coincideUsuario && coincideFecha;
  });
  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setUsuarioSeleccionado("");
    setFechaInicio("");
    setFechaFin("");
  };
  // Exportar los datos filtrados a PDF
  const exportarPDF = () => {
    if (registrosFiltrados.length === 0) {
      setAlerta({
        mensaje: "No hay registros que coincidan con los filtros para exportar.",
        tipo: "warning"
      });
      setTimeout(() => setAlerta(null), 4000);
      return;
    }
    const doc = new jsPDF();
    // Encabezado del PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte de Auditoría de Acciones", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 26);
    // Definición de columnas y filas para jsPDF-AutoTable
    const columnas = ["Fecha y Hora", "Usuario", "Rol", "Acción Realizada"];
    const filas = registrosFiltrados.map((a) => [
      a.fecha ? new Date(a.fecha).toLocaleString() : "",
      a.nombre || "",
      a.rol || "",
      a.accion || "",
    ]);
    doc.autoTable({
      startY: 32,
      head: [columnas],
      body: filas,
      theme: "striped",
      headStyles: { fillColor: [31, 61, 43] }, // Verde principal
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: "auto" },
      },
    });
    doc.save(`auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-title">
          <div className="icon-box">📋</div>
          <div>
            <h1>Auditoría</h1>
            <p>Registro de acciones realizadas</p>
          </div>
        </div>
        
        {/* Botón de exportación en la cabecera */}
        <div>
          <button 
            onClick={exportarPDF}
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--verde-principal)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>
      {alerta && (
        <div className={`alerta ${alerta.tipo}`} style={{ marginBottom: "20px" }}>
          {alerta.mensaje}
        </div>
      )}
      {/* Contenedor de Filtros */}
      <div className="card" style={{ marginBottom: "20px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#666" }}>
            Filtros
          </h3>
          {(busqueda || usuarioSeleccionado || fechaInicio || fechaFin) && (
            <button 
              onClick={limpiarFiltros} 
              style={{
                background: "none",
                border: "none",
                color: "#4f46e5",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px"
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {/* Buscador */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: "1", minWidth: "200px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888" }}>Buscar</label>
            <input
              type="text"
              placeholder="Buscar por usuario, rol o acción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px"
              }}
            />
          </div>
          {/* Selector de Usuario */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: "1", minWidth: "150px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888" }}>Usuario</label>
            <select
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "white"
              }}
            >
              <option value="">Todos los usuarios</option>
              {usuariosUnicos.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          {/* Fecha Inicio */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "140px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888" }}>Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px"
              }}
            />
          </div>
          {/* Fecha Fin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "140px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#888" }}>Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px"
              }}
            />
          </div>
        </div>
      </div>
      {/* Tabla con resultados filtrados */}
      <div className="card">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                    No se encontraron registros de auditoría con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((a) => (
                  <tr key={a.id_auditoria}>
                    <td>{a.fecha ? new Date(a.fecha).toLocaleString() : ""}</td>
                    <td>{a.nombre}</td>
                    <td>{a.rol || "N/A"}</td>
                    <td>{a.accion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export default Auditoria;
