import { useEffect, useState } from "react";
import api from "../services/api";
import ActionMenu from "../components/ActionMenu";
export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    correo: "",
    estado: 1
  });
  // Estado para guardar los mensajes de validación
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(null);
  // Estado para el modal de confirmación de eliminación
  const [proveedorParaEliminar, setProveedorParaEliminar] = useState(null);
  // Estado para alertas personalizadas (reemplazo de window.alert)
  const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" | "warning" }
  const cargarProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    cargarProveedores();
  }, []);
  const handleKeyPressOnlyLetters = (e) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
      e.preventDefault();
    }
  };
  const handleKeyPressPhone = (e) => {
    if (!/[0-9\s+-]/.test(e.key)) {
      e.preventDefault();
    }
  };
  // Validar datos antes de guardar
  const validarFormulario = () => {
    let nuevosErrores = {};
    // Validar Nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre del proveedor es obligatorio.";
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }
    // Validar Teléfono
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!/^[0-9\s+-]+$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = "Formato de teléfono no válido.";
    } else if (formData.telefono.trim().replace(/\D/g, "").length < 7) {
      nuevosErrores.telefono = "Debe tener al menos 7 dígitos.";
    }
    // Validar Correo (Opcional, pero valida si se escribe)
    if (formData.correo.trim()) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(formData.correo.trim())) {
        nuevosErrores.correo = "Ingrese un formato de correo válido.";
      }
    }
    // Validar Dirección
    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria.";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  const guardarProveedor = async () => {
    if (!validarFormulario()) {
      return;
    }
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      
      const datosEnviar = {
        ...formData,
        id_usuario // Se envía para la auditoría
      };
      if (editando) {
        // Petición para actualizar
        const res = await api.put(
          `/proveedores/${editando}`,
          datosEnviar
        );
        setAlerta({
          mensaje: "Proveedor actualizado correctamente.",
          tipo: "success"
        });
      } else {
        // Petición para crear
        const res = await api.post(
          "/proveedores",
          datosEnviar
        );
        setAlerta({
          mensaje: "Proveedor registrado correctamente.",
          tipo: "success"
        });
      }
      setFormData({
        nombre: "",
        telefono: "",
        direccion: "",
        correo: "",
        estado: 1
      });
      setErrores({});
      setEditando(null);
      cargarProveedores();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al procesar la solicitud.",
        tipo: "error"
      });
    }
  };
  // Abre el modal de confirmación de eliminación
  const iniciarEliminacion = (proveedor) => {
    setProveedorParaEliminar(proveedor);
  };
  // Procesa la eliminación tras la interacción en el modal
  const confirmarEliminarProveedor = async () => {
    if (!proveedorParaEliminar) return;
    const id = proveedorParaEliminar.id_proveedor;
    setProveedorParaEliminar(null); // Cerrar modal inmediatamente
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      const res = await api.delete(
        `/proveedores/${id}`,
        {
          params: { id_usuario } // Se envía id_usuario por query parameter (?id_usuario=X)
        }
      );
      setAlerta({
        mensaje: res.data?.mensaje || "Proveedor eliminado con éxito.",
        tipo: "success"
      });
      cargarProveedores();
    } catch (error) {
      console.error(error);
      setAlerta({
        // Si el backend no lo permite (relacionado con tableros/accesorios) se mostrará aquí
        mensaje: error.response?.data?.mensaje || "Error al intentar eliminar el proveedor.",
        tipo: "warning"
      });
    }
  };
  const activarProveedorDirecto = async (p) => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
    const datosEnviar = {
      nombre: p.nombre,
      telefono: p.telefono,
      direccion: p.direccion,
      correo: p.correo,
      id_usuario,
      estado: 1
    };
    try {
      await api.put(`/proveedores/${p.id_proveedor}`, datosEnviar);
      setAlerta({
        mensaje: "Proveedor activado correctamente.",
        tipo: "success"
      });
      cargarProveedores();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: "Error al activar el proveedor.",
        tipo: "error"
      });
    }
  };
  const editarProveedor = (proveedor) => {
    setEditando(proveedor.id_proveedor);
    setFormData({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      direccion: proveedor.direccion,
      correo: proveedor.correo,
      estado: proveedor.estado ? 1 : 0
    });
    setErrores({}); // Limpiar errores previos
  };
  const proveedoresFiltrados = proveedores.filter((p) =>
    `${p.nombre} ${p.telefono} ${p.correo}`
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">🚚</div>
          <div>
            <h1>Proveedores</h1>
            <p>Gestiona los proveedores del sistema</p>
          </div>
        </div>
        <div className="breadcrumb">Inicio / Proveedores</div>
      </div>
      <div className="crud-top">
        <div className="card form-card">
          <h3>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
          <div className="form-grid">
            {/* Nombre */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                placeholder="🏢 Nombre proveedor"
                value={formData.nombre}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
                  setFormData({ ...formData, nombre: val });
                  if (errores.nombre) setErrores({ ...errores, nombre: "" });
                }}
                onKeyPress={handleKeyPressOnlyLetters}
                style={errores.nombre ? { borderColor: "#ef4444" } : {}}
              />
              {errores.nombre && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.nombre}
                </span>
              )}
            </div>
            {/* Teléfono */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                placeholder="📞 Teléfono"
                value={formData.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, telefono: val });
                  if (errores.telefono) setErrores({ ...errores, telefono: "" });
                }}
                onKeyPress={handleKeyPressPhone}
                maxLength={10}
                style={errores.telefono ? { borderColor: "#ef4444" } : {}}
              />
              {errores.telefono && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.telefono}
                </span>
              )}
            </div>
            {/* Dirección */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                placeholder="📍 Dirección"
                value={formData.direccion}
                onChange={(e) => {
                  setFormData({ ...formData, direccion: e.target.value });
                  if (errores.direccion) setErrores({ ...errores, direccion: "" });
                }}
                style={errores.direccion ? { borderColor: "#ef4444" } : {}}
              />
              {errores.direccion && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.direccion}
                </span>
              )}
            </div>
            {/* Correo */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="email"
                placeholder="✉ Correo"
                value={formData.correo}
                onChange={(e) => {
                  setFormData({ ...formData, correo: e.target.value });
                  if (errores.correo) setErrores({ ...errores, correo: "" });
                }}
                style={errores.correo ? { borderColor: "#ef4444" } : {}}
              />
              {errores.correo && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.correo}
                </span>
              )}
            </div>
            {/* Estado */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: parseInt(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="crud-actions">
            <button className="btn-green" onClick={guardarProveedor}>
              {editando ? "Actualizar Proveedor" : "Guardar Proveedor"}
            </button>
            <button
              className="btn-light"
              onClick={() => {
                setEditando(null);
                setFormData({
                  nombre: "",
                  telefono: "",
                  direccion: "",
                  correo: "",
                  estado: 1
                });
                setErrores({});
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <h3>Lista de Proveedores</h3>
          <div className="table-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>
        <table id="tablaProveedores">
          <thead>
            <tr>
              <th>#</th>
              <th>Proveedor</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((p, index) => (
              <tr key={p.id_proveedor}>
                <td>{index + 1}</td>
                <td>
                  <div className="user-info">
                    <div className="avatar">{p.nombre?.charAt(0)}</div>
                    {p.nombre}
                  </div>
                </td>
                <td>{p.telefono}</td>
                <td>{p.direccion}</td>
                <td>{p.correo}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: p.estado ? "#d1fae5" : "#fee2e2",
                    color: p.estado ? "#065f46" : "#991b1b"
                  }}>
                    {p.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="actions">
                  <ActionMenu
                    estado={p.estado}
                    onEdit={() => editarProveedor(p)}
                    onDelete={() => iniciarEliminacion(p)}
                    onActivate={() => activarProveedorDirecto(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de React para confirmar la eliminación de un proveedor */}
      {proveedorParaEliminar && (
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
              ¿Eliminar Proveedor?
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              ¿Está seguro que desea eliminar al proveedor <strong>{proveedorParaEliminar.nombre}</strong>?<br />
              Esta acción es permanente y no se podrá revertir.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setProveedorParaEliminar(null)}
                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete" 
                onClick={confirmarEliminarProveedor}
                style={{ 
                  padding: "8px 20px", 
                  cursor: "pointer", 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "6px",
                  fontWeight: "600"
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de React para Mensajes / Alertas personalizadas (Reemplazo de window.alert) */}
      {alerta && (
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
          zIndex: 1100
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
              {alerta.tipo === "success" ? "✅" : alerta.tipo === "error" ? "❌" : "⚠️"}
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: "18px", 
              fontWeight: "bold", 
              color: alerta.tipo === "success" ? "#10b981" : alerta.tipo === "error" ? "#ef4444" : "#f59e0b"
            }}>
              {alerta.tipo === "success" ? "Operación Exitosa" : alerta.tipo === "error" ? "Error" : "Advertencia"}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              {alerta.mensaje}
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <button 
                className="btn-green" 
                onClick={() => setAlerta(null)}
                style={{ 
                  padding: "8px 30px", 
                  cursor: "pointer", 
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "600",
                  backgroundColor: alerta.tipo === "success" ? "#10b981" : alerta.tipo === "error" ? "#ef4444" : "#f59e0b",
                  color: "white"
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
