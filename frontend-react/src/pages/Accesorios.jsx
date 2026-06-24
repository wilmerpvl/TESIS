import { useEffect, useState } from "react";
import axios from "axios";
import {
  obtenerAccesorios,
  crearAccesorio,
  actualizarAccesorio,
  eliminarAccesorio
} from "../services/accesoriosService";
function Accesorios() {
  const [accesorios, setAccesorios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  // Estados para validaciones y modales personalizados
  const [errores, setErrores] = useState({});
  const [accesorioParaEliminar, setAccesorioParaEliminar] = useState(null);
  const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" | "warning" }
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    material: "",
    tamano: "",
    color: "",
    precio_unitario: "",
    id_proveedor: "",
    estado: 1
  });
  useEffect(() => {
    cargarDatos();
    cargarProveedores();
  }, []);
  const cargarDatos = async () => {
    try {
      const data = await obtenerAccesorios();
      setAccesorios(data);
    } catch (error) {
      console.error("Error al cargar accesorios:", error);
    }
  };
  const cargarProveedores = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };
  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      categoria: "",
      material: "",
      tamano: "",
      color: "",
      precio_unitario: "",
      id_proveedor: "",
      estado: 1
    });
    setEditando(null);
    setErrores({});
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Limpiar error al escribir
    if (errores[e.target.name]) {
      setErrores({
        ...errores,
        [e.target.name]: ""
      });
    }
  };
  // Validaciones del Formulario
  const validarFormulario = () => {
    let nuevosErrores = {};
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (form.nombre.trim().length < 3) {
      nuevosErrores.nombre = "Debe tener al menos 3 caracteres.";
    }
    if (!form.categoria) {
      nuevosErrores.categoria = "La categoría es obligatoria.";
    }
    if (!form.material) {
      nuevosErrores.material = "El material es obligatorio.";
    }
    if (form.precio_unitario === "" || isNaN(form.precio_unitario) || parseFloat(form.precio_unitario) < 0) {
      nuevosErrores.precio_unitario = "Debe ser un precio válido.";
    }
    if (!form.id_proveedor) {
      nuevosErrores.id_proveedor = "Seleccione un proveedor.";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  const guardar = async () => {
    if (!validarFormulario()) {
      return;
    }
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      // El formulario de React usa 'categoria', pero el backend usa 'tipo'.
      // Creamos el payload uniendo ambos campos y agregando id_usuario para la auditoría.
      const datosEnviar = {
        ...form,
        tipo: form.categoria, // Mapeado para el backend
        id_usuario // Para auditoría
      };
      if (editando) {
        await actualizarAccesorio(editando, datosEnviar);
        setAlerta({
          mensaje: "Accesorio actualizado correctamente.",
          tipo: "success"
        });
      } else {
        await crearAccesorio(datosEnviar);
        setAlerta({
          mensaje: "Accesorio registrado correctamente.",
          tipo: "success"
        });
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al procesar la solicitud.",
        tipo: "error"
      });
    }
  };
  const editar = (accesorio) => {
    setForm({
      nombre: accesorio.nombre,
      categoria: accesorio.categoria || accesorio.tipo || "",
      material: accesorio.material || "",
      tamano: accesorio.tamano || "",
      color: accesorio.color || "",
      precio_unitario: accesorio.precio_unitario,
      id_proveedor: accesorio.id_proveedor || "",
      estado: accesorio.estado ? 1 : 0
    });
    setEditando(accesorio.id_accesorio);
    setErrores({});
  };
  const iniciarEliminacion = (accesorio) => {
    setAccesorioParaEliminar(accesorio);
  };
  const confirmarEliminar = async () => {
    if (!accesorioParaEliminar) return;
    const id = accesorioParaEliminar.id_accesorio;
    setAccesorioParaEliminar(null); // Cerrar modal
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      // Pasamos el id y el id_usuario al servicio
      const data = await eliminarAccesorio(id, id_usuario);
      
      setAlerta({
        mensaje: data.mensaje || "Accesorio eliminado con éxito.",
        tipo: "success"
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al intentar eliminar el accesorio.",
        tipo: "warning"
      });
    }
  };
  const filtrados = accesorios.filter((t) =>
    Object.values(t)
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">🔩</div>
          <div>
            <h1>Accesorios</h1>
            <p>Gestión de accesorios del sistema</p>
          </div>
        </div>
        <div className="breadcrumb">Inicio / Accesorios</div>
      </div>
      <div className="crud-top">
        <div className="card form-card">
          <h3>{editando ? "Editar Accesorio" : "Nuevo Accesorio"}</h3>
          <div className="form-grid">
            {/* Nombre */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                style={errores.nombre ? { borderColor: "#ef4444" } : {}}
              />
              {errores.nombre && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.nombre}
                </span>
              )}
            </div>
            {/* Categoría */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                style={errores.categoria ? { borderColor: "#ef4444" } : {}}
              >
                <option value="">Seleccionar categoría</option>
                <option value="Bisagra">Bisagra</option>
                <option value="Riel">Riel</option>
                <option value="Agarradera">Agarradera</option>
                <option value="Tornillo">Tornillo</option>
                <option value="Bordo PVC">Bordo PVC</option>
              </select>
              {errores.categoria && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.categoria}
                </span>
              )}
            </div>
            {/* Material */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="material"
                value={form.material}
                onChange={handleChange}
                style={errores.material ? { borderColor: "#ef4444" } : {}}
              >
                <option value="">Seleccionar material</option>
                <option value="Acero">Acero</option>
                <option value="Aluminio">Aluminio</option>
                <option value="PVC">PVC</option>
              </select>
              {errores.material && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.material}
                </span>
              )}
            </div>
            {/* Tamaño */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="tamano"
                placeholder="Tamaño"
                value={form.tamano}
                onChange={handleChange}
              />
            </div>
            {/* Color */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="color"
                placeholder="Color"
                value={form.color}
                onChange={handleChange}
              />
            </div>
            {/* Precio */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="number"
                step="0.01"
                name="precio_unitario"
                placeholder="Precio"
                value={form.precio_unitario}
                onChange={handleChange}
                style={errores.precio_unitario ? { borderColor: "#ef4444" } : {}}
              />
              {errores.precio_unitario && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.precio_unitario}
                </span>
              )}
            </div>
            {/* Proveedor */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="id_proveedor"
                value={form.id_proveedor}
                onChange={handleChange}
                style={errores.id_proveedor ? { borderColor: "#ef4444" } : {}}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores
                  .filter(prov => prov.estado || prov.id_proveedor === Number(form.id_proveedor))
                  .map(prov => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre} {!prov.estado && "(Inactivo)"}
                    </option>
                  ))
                }
              </select>
              {errores.id_proveedor && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.id_proveedor}
                </span>
              )}
            </div>
            {/* Estado */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="estado"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: parseInt(e.target.value) })}
                style={{
                  padding: "12px",
                  border: "1px solid #dcdfe4",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px"
                }}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="crud-actions">
            <button className="btn-green" onClick={guardar}>
              {editando ? "Actualizar" : "Registrar"}
            </button>
            <button className="btn-light" onClick={limpiarFormulario}>
              Limpiar
            </button>
          </div>
        </div>
        <div className="card search-card">
          <h3>Buscar Accesorios</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <h3>Lista de Accesorios</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Material</th>
              <th>Tamaño</th>
              <th>Color</th>
              <th>Proveedor</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a, i) => (
              <tr key={a.id_accesorio}>
                <td>{i + 1}</td>
                <td>{a.nombre}</td>
                <td>
                  <span className="badge badge-accesorio">
                    {a.categoria || a.tipo}
                  </span>
                </td>
                <td>{a.material || "-"}</td>
                <td>{a.tamano || "-"}</td>
                <td>{a.color || "-"}</td>
                <td>{a.proveedor || "-"}</td>
                <td>${Number(a.precio_unitario || 0).toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: a.estado ? "#d1fae5" : "#fee2e2",
                    color: a.estado ? "#065f46" : "#991b1b"
                  }}>
                    {a.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => editar(a)}>
                    ✏️
                  </button>
                  <button className="btn-delete" onClick={() => iniciarEliminacion(a)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de React para confirmar la eliminación de un accesorio */}
      {accesorioParaEliminar && (
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
              ¿Eliminar Accesorio?
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              ¿Está seguro que desea eliminar el accesorio <strong>{accesorioParaEliminar.nombre}</strong>?<br />
              Esta acción es permanente y no se podrá revertir.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setAccesorioParaEliminar(null)}
                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete" 
                onClick={confirmarEliminar}
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
export default Accesorios;
