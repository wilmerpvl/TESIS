import "../css/trabajos.css";
import {
  useEffect,
  useState
} from "react";
import {
  obtenerTrabajosDisponibles,
  crearTrabajo
}
  from "../services/cotizacionService";
export default function Trabajos() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [buscar, setBuscar] = useState("");
  
  // Estados para el Modal de inicio de trabajo
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [fechaEstimada, setFechaEstimada] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  useEffect(() => {
    cargar();
  }, []);

  const trabajosFiltrados = cotizaciones.filter(c => {
    const busqueda = buscar.toLowerCase();
    return (
      String(c.id_cotizacion).toLowerCase().includes(busqueda) ||
      String(c.cliente || "").toLowerCase().includes(busqueda) ||
      String(c.tipo_mueble || "").toLowerCase().includes(busqueda) ||
      String(c.total_final || "").toLowerCase().includes(busqueda)
    );
  });
  const cargar = async () => {
    const data = await obtenerTrabajosDisponibles();
    setCotizaciones(data);
  };
  // Abre el modal interactivo de inicio en lugar de usar prompt()
  const abrirModalIniciar = (cotizacion) => {
    // Definimos una fecha estimada por defecto de 7 días a partir de hoy
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 7);
    const fechaPorDefecto = hoy.toISOString().slice(0, 10);
    setCotizacionSeleccionada(cotizacion);
    setFechaEstimada(fechaPorDefecto);
    setPrioridad("MEDIA");
  };
  // Confirma el inicio del trabajo desde el modal
  const confirmarIniciarTrabajo = async () => {
    if (!fechaEstimada) {
      alert("Por favor, seleccione una fecha estimada.");
      return;
    }
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      await crearTrabajo({
        id_cotizacion: cotizacionSeleccionada.id_cotizacion,
        fecha_estimada: fechaEstimada,
        prioridad: prioridad,
        id_usuario // Se envía para auditar quién creó el trabajo
      });
      alert("Trabajo creado correctamente");
      setCotizacionSeleccionada(null); // Cerrar el modal
      cargar(); // Recargar la tabla
    } catch (error) {
      console.error(error);
      alert("Error al crear el trabajo.");
    }
  };
  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">🛠️</div>
          <div>
            <h1>Cotizaciones</h1>
            <p>Cotizaciones pendientes de producción</p>
          </div>
        </div>
      </div>
      {cotizaciones.length === 0 && (
        <div className="card">
          <h3>No existen cotizaciones pendientes</h3>
        </div>
      )}
      {cotizaciones.length > 0 && (
        <>
          <div className="card search-card" style={{ marginBottom: "20px" }}>
            <h3>Buscar Cotización Pendiente</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por ID, cliente, mueble..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
          </div>
          <div className="card">
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Cotización</th>
                    <th>Cliente</th>
                    <th>Mueble</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                        No se encontraron cotizaciones pendientes con el criterio de búsqueda.
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
                          <span className="estado-pendiente">Pendiente</span>
                        </td>
                        <td>
                          <button
                            className="btn-green"
                            onClick={() => abrirModalIniciar(c)}
                          >
                            Iniciar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
                Fecha estimada de entrega
              </label>
              <input 
                type="date" 
                value={fechaEstimada} 
                onChange={(e) => setFechaEstimada(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
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
    </div>
  );
}
