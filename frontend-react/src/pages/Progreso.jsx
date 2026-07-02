import "../css/progreso.css";
import {
  useEffect,
  useState
} from "react";
import {
  obtenerTrabajosProgreso,
  obtenerTrabajosCompletados,
  obtenerDetalleTrabajo,
  obtenerAvances,
  registrarAvance,
  finalizarTrabajo
}
  from "../services/cotizacionService";

const obtenerFechaActualLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Progreso() {
  const [tabActiva, setTabActiva] = useState("proceso"); // "proceso" o "completados"
  const [buscar, setBuscar] = useState("");
  
  const [trabajos,
    setTrabajos] =
    useState([]);
  const [trabajosCompletados,
    setTrabajosCompletados] =
    useState([]);
  const [trabajoSeleccionado,
    setTrabajoSeleccionado] =
    useState(null);
  const [avances,
    setAvances] =
    useState([]);
  const [porcentaje,
    setPorcentaje] =
    useState("");
  const [descripcion,
    setDescripcion] =
    useState("");
  const [imagen,
    setImagen] =
    useState(null);
  const [fecha,
    setFecha] =
    useState(obtenerFechaActualLocal());
  useEffect(() => {
    cargarTrabajos();
  }, []);

  const trabajosFiltrados = trabajos.filter(t => {
    const busqueda = buscar.toLowerCase();
    return (
      String(t.id_trabajo).toLowerCase().includes(busqueda) ||
      String(t.cliente || "").toLowerCase().includes(busqueda) ||
      String(t.tipo_mueble || "").toLowerCase().includes(busqueda) ||
      String(t.avance || "").toLowerCase().includes(busqueda)
    );
  });

  const trabajosCompletadosFiltrados = trabajosCompletados.filter(t => {
    const busqueda = buscar.toLowerCase();
    return (
      String(t.id_trabajo).toLowerCase().includes(busqueda) ||
      String(t.cliente || "").toLowerCase().includes(busqueda) ||
      String(t.tipo_mueble || "").toLowerCase().includes(busqueda) ||
      (t.fecha_fin && String(t.fecha_fin).toLowerCase().includes(busqueda))
    );
  });
  const cargarTrabajos =
    async () => {
      try {
        const data = await obtenerTrabajosProgreso();
        setTrabajos(data);
        const dataCompletados = await obtenerTrabajosCompletados();
        setTrabajosCompletados(dataCompletados);
      }
      catch (error) {
        console.error(error);
      }
    };
  const verTrabajo =
    async (idTrabajo) => {
      try {
        const detalle =
          await obtenerDetalleTrabajo(
            idTrabajo
          );
        const historial =
          await obtenerAvances(
            idTrabajo
          );
        setTrabajoSeleccionado(
          detalle
        );
        setAvances(
          historial
        );
      }
      catch (error) {
        console.error(error);
      }
    };
  const guardarAvance =
    async () => {
      if (
        !trabajoSeleccionado
      ) {
        return;
      }
      // Validación del porcentaje en el frontend
      const pctVal = parseInt(porcentaje);
      if (isNaN(pctVal) || pctVal < 0 || pctVal > 100) {
        alert("Por favor, ingrese un porcentaje de avance válido entre 0 y 100.");
        return;
      }
      try {
        // Obtener el ID del usuario logueado desde localStorage
        const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
        await registrarAvance({
          id_trabajo:
            trabajoSeleccionado.id_trabajo,
          porcentaje: pctVal,
          descripcion,
          imagen,
          id_usuario, // Se envía para auditar quién registró el avance
          fecha // Se envía la fecha seleccionada manualmente
        });
        alert(
          "Avance registrado"
        );
        setPorcentaje("");
        setDescripcion("");
        setImagen(null);
        setFecha(obtenerFechaActualLocal());
        verTrabajo(
          trabajoSeleccionado.id_trabajo
        );
        cargarTrabajos();
      }
      catch (error) {
        console.error(error);
        alert(error.message || "Error al registrar el avance");
      }
    };
  const completarTrabajo =
    async () => {
      if (
        !trabajoSeleccionado
      ) {
        return;
      }
      const confirmar =
        window.confirm(
          "¿Finalizar trabajo?"
        );
      if (!confirmar) {
        return;
      }
      try {
        // Obtener el ID del usuario logueado desde localStorage
        const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
        await finalizarTrabajo(
          trabajoSeleccionado.id_trabajo,
          id_usuario // Se envía para auditar quién completó el trabajo
        );
        alert(
          "Trabajo completado"
        );
        setTrabajoSeleccionado(
          null
        );
        setAvances([]);
        cargarTrabajos();
      }
      catch (error) {
        console.error(error);
      }
    };
  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">
            📈
          </div>
          <div>
            <h1>
              Trabajos
            </h1>
            <p>
              Seguimiento de producción de trabajos
            </p>
          </div>
        </div>
      </div>
      {/* Selector de Pestañas (Tab Activa) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => {
            setTabActiva("proceso");
            setTrabajoSeleccionado(null);
            setBuscar("");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: tabActiva === "proceso" ? "#24833c" : "white",
            color: tabActiva === "proceso" ? "white" : "#4a5568",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s"
          }}
        >
          En Proceso ({trabajos.length})
        </button>
        <button
          onClick={() => {
            setTabActiva("completados");
            setTrabajoSeleccionado(null);
            setBuscar("");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: tabActiva === "completados" ? "#24833c" : "white",
            color: tabActiva === "completados" ? "white" : "#4a5568",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s"
          }}
        >
          Finalizados ({trabajosCompletados.length})
        </button>
      </div>
      {/* Buscador */}
      <div className="card search-card" style={{ marginBottom: "20px" }}>
        <h3>Buscar Trabajo ({tabActiva === "proceso" ? "En Proceso" : "Finalizado"})</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por ID, cliente, mueble..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
      </div>
      {/* Vista de Trabajos en Proceso */}
      {tabActiva === "proceso" && (
        <div className="card">
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Trabajo</th>
                  <th>Cliente</th>
                  <th>Mueble</th>
                  <th>Avance</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {trabajosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                      No se encontraron trabajos en proceso con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  trabajosFiltrados.map(t => (
                    <tr key={t.id_trabajo}>
                      <td>#{t.id_trabajo}</td>
                      <td>{t.cliente}</td>
                      <td>{t.tipo_mueble}</td>
                      <td>{t.avance}%</td>
                      <td>
                        <span className="estado-proceso">En proceso</span>
                      </td>
                      <td>
                        <button
                          className="btn-green"
                          onClick={() => verTrabajo(t.id_trabajo)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Vista de Trabajos Finalizados */}
      {tabActiva === "completados" && (
        <div className="card">
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Trabajo</th>
                  <th>Cliente</th>
                  <th>Mueble</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {trabajosCompletadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                      No se encontraron trabajos finalizados con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  trabajosCompletadosFiltrados.map(t => (
                    <tr key={t.id_trabajo}>
                      <td>#{t.id_trabajo}</td>
                      <td>{t.cliente}</td>
                      <td>{t.tipo_mueble}</td>
                      <td>{t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString() : ""}</td>
                      <td>
                        <span className="estado-proceso" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                          Completado
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-green"
                          onClick={() => verTrabajo(t.id_trabajo)}
                        >
                          Historial
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Sección Detalle del Trabajo Seleccionado */}
      {trabajoSeleccionado && (
        <div className="card" style={{ marginTop: "25px", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          {/* Cabecera del Detalle con Botón de Cerrar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
            <h2 style={{ fontSize: "24px", color: "#1e293b", margin: 0 }}>Trabajo #{trabajoSeleccionado.id_trabajo}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {trabajoSeleccionado.estado === 'COMPLETADO' && (
                <span 
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    fontSize: "13px"
                  }}
                >
                  ✓ Trabajo Finalizado
                </span>
              )}
              <button 
                onClick={() => {
                  setTrabajoSeleccionado(null);
                  setAvances([]);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          {/* RESUMEN */}
          <div className="progreso-info">
            <div className="info-card">
              <span>Cliente</span>
              <h3>{trabajoSeleccionado.cliente}</h3>
            </div>
            <div className="info-card">
              <span>Mueble</span>
              <h3>{trabajoSeleccionado.tipo_mueble}</h3>
            </div>
            <div className="info-card">
              <span>Total</span>
              <h3>${Number(trabajoSeleccionado.total_final).toFixed(2)}</h3>
            </div>
          </div>

          {/* BARRA PROGRESO */}
          <div className="progreso-detalle-seccion">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#475569", margin: 0 }}>Avance general</h3>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>
                {trabajoSeleccionado.estado === 'COMPLETADO' ? 100 : (trabajoSeleccionado.avance || 0)}%
              </span>
            </div>
            <div className="custom-progress-bar">
              <div
                className="custom-progress-fill"
                style={{
                  width: `${trabajoSeleccionado.estado === 'COMPLETADO' ? 100 : (trabajoSeleccionado.avance || 0)}%`,
                  backgroundColor: trabajoSeleccionado.estado === 'COMPLETADO' ? "#10b981" : "#3b7f4a"
                }}
              />
            </div>
          </div>

          {/* FORMULARIO - SOLO VISIBLE SI NO ESTÁ COMPLETADO */}
          {trabajoSeleccionado.estado !== 'COMPLETADO' && (
            <div className="progreso-detalle-seccion">
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "15px" }}>
                📝 Registrar nuevo avance
              </h3>
              
              <div className="progreso-formulario-container">
                <div className="form-grid">
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Porcentaje (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={porcentaje}
                      onChange={(e) => setPorcentaje(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Fecha del Avance</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Descripción del Avance</label>
                    <input
                      type="text"
                      value={descripcion}
                      placeholder="Ej: Corte terminado"
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                </div>

                <div className="file-input-wrapper">
                  <label style={{ fontWeight: "600", fontSize: "14px", color: "#475569" }}>Evidencia fotográfica</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files[0])}
                    style={{ border: "none", padding: 0 }}
                  />
                  {imagen && (
                    <div style={{ marginTop: "15px", position: "relative" }}>
                      <img
                        src={URL.createObjectURL(imagen)}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          width: "300px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1"
                        }}
                      />
                      <button
                        onClick={() => setImagen(null)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "25px",
                          height: "25px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="progreso-form-actions">
                  <button
                    className="btn-green"
                    onClick={guardarAvance}
                    style={{ padding: "12px 24px", borderRadius: "8px", fontSize: "15px" }}
                  >
                    💾 Guardar avance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORIAL */}
          <div className="progreso-detalle-seccion">
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>
              ⏳ Historial de avances registrados
            </h3>
            
            {avances.length === 0 ? (
              <div className="card" style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc" }}>
                No existen avances registrados para este trabajo.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {avances.map(a => (
                  <div
                    key={a.id_avance}
                    className="avance-historial-card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "20px",
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
                      borderLeft: "5px solid #3b7f4a"
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ 
                          backgroundColor: "#eaf5ec", 
                          color: "#3b7f4a", 
                          padding: "4px 10px", 
                          borderRadius: "6px", 
                          fontWeight: "bold",
                          fontSize: "14px"
                        }}>
                          {a.porcentaje}%
                        </span>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                          📅 {new Date(a.fecha).toLocaleDateString()}
                        </span>
                        {a.registrado_por ? (
                          <span style={{ fontSize: "12px", backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 {a.registrado_por}
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 Sistema
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: "#334155", fontSize: "15px", lineHeight: "1.5" }}>
                        {a.descripcion || "Sin descripción proporcionada"}
                      </p>
                    </div>
                    {a.url_imagen && (
                      <div style={{ flexShrink: 0 }}>
                        <a href={`http://localhost:3000${a.url_imagen}`} target="_blank" rel="noopener noreferrer">
                          <img
                            src={`http://localhost:3000${a.url_imagen}`}
                            alt="Evidencia fotográfica"
                            style={{
                              width: "110px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              transition: "transform 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACCIÓN COMPLETAR - SOLO VISIBLE SI NO ESTÁ COMPLETADO Y ESTÁ AL 100% */}
          {trabajoSeleccionado.estado !== 'COMPLETADO' && Number(trabajoSeleccionado.avance) === 100 && (
            <div className="progreso-detalle-seccion" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="btn-delete"
                onClick={completarTrabajo}
                style={{ padding: "12px 24px", borderRadius: "8px", fontSize: "15px", fontWeight: "bold" }}
              >
                🏁 Finalizar Trabajo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
