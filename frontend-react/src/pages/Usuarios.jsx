import { useEffect, useState } from "react";
import axios from "axios";
const API = "http://localhost:3000/api";
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [editando, setEditando] = useState(null);
  // Estados para validaciones y modales personalizados
  const [errores, setErrores] = useState({});
  const [usuarioParaEliminar, setUsuarioParaEliminar] = useState(null);
  const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" | "warning" }
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "",
    estado: 1
  });
  useEffect(() => {
    obtenerUsuarios();
  }, []);
  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(`${API}/usuarios`);
      setUsuarios(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Limpiar el error del campo
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
      nuevosErrores.nombre = "El nombre completo es obligatorio.";
    } else if (form.nombre.trim().length < 3) {
      nuevosErrores.nombre = "Debe tener al menos 3 caracteres.";
    }
    if (!form.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevosErrores.email = "Ingrese un correo electrónico válido.";
    }
    // Contraseña es obligatoria al crear, opcional al editar
    if (!editando && !form.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria para nuevos usuarios.";
    } else if (form.password.trim() && form.password.trim().length < 4) {
      nuevosErrores.password = "Debe tener al menos 4 caracteres.";
    }
    if (!form.rol) {
      nuevosErrores.rol = "El rol es obligatorio.";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  const guardarUsuario = async () => {
    if (!validarFormulario()) return;
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      
      const datosEnviar = {
        ...form,
        id_usuario // Se envía para la auditoría
      };
      await axios.post(`${API}/usuarios`, datosEnviar);
      setAlerta({
        mensaje: "Usuario registrado correctamente.",
        tipo: "success"
      });
      setForm({
        nombre: "",
        email: "",
        password: "",
        rol: "",
        estado: 1
      });
      setErrores({});
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al registrar el usuario.",
        tipo: "error"
      });
    }
  };
  const actualizarUsuario = async () => {
    if (!validarFormulario()) return;
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      
      const datosEnviar = {
        ...form,
        id_usuario // Se envía para la auditoría
      };
      await axios.put(
        `${API}/usuarios/${editando}`,
        datosEnviar
      );
      setAlerta({
        mensaje: "Usuario actualizado correctamente.",
        tipo: "success"
      });
      setEditando(null);
      setForm({
        nombre: "",
        email: "",
        password: "",
        rol: "",
        estado: 1
      });
      setErrores({});
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al actualizar el usuario.",
        tipo: "error"
      });
    }
  };
  const iniciarEliminacion = (usuario) => {
    setUsuarioParaEliminar(usuario);
  };
  const confirmarEliminar = async () => {
    if (!usuarioParaEliminar) return;
    const id = usuarioParaEliminar.id_usuario;
    setUsuarioParaEliminar(null); // Cerrar modal
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      const res = await axios.delete(
        `${API}/usuarios/${id}`,
        {
          params: { id_usuario } // Se envía id_usuario por query params (?id_usuario=X)
        }
      );
      setAlerta({
        mensaje: res.data?.mensaje || "Usuario eliminado con éxito.",
        tipo: "success"
      });
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al intentar eliminar el usuario.",
        tipo: "warning"
      });
    }
  };
  const editarUsuario = (usuario) => {
    setEditando(usuario.id_usuario);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "", // Contraseña vacía al editar
      rol: usuario.rol,
      estado: usuario.estado ? 1 : 0
    });
    setErrores({});
  };
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre
        .toLowerCase()
        .includes(buscar.toLowerCase()) ||
      u.email
        .toLowerCase()
        .includes(buscar.toLowerCase())
  );
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">👥</div>
          <div>
            <h1>Usuarios</h1>
            <p>Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <div className="breadcrumb">Inicio / Usuarios</div>
      </div>
      <div className="crud-top">
        <div className="card form-card">
          <h3>{editando ? "Editar Usuario" : "Nuevo Usuario"}</h3>
          <div className="form-grid">
            {/* Nombre */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="nombre"
                placeholder="👤 Nombre completo"
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
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="email"
                name="email"
                placeholder="✉ Correo electrónico"
                value={form.email}
                onChange={handleChange}
                style={errores.email ? { borderColor: "#ef4444" } : {}}
              />
              {errores.email && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.email}
                </span>
              )}
            </div>
            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="password"
                placeholder={editando ? "🔒 Contraseña (dejar vacío para no cambiar)" : "🔒 Contraseña"}
                value={form.password}
                onChange={handleChange}
                style={errores.password ? { borderColor: "#ef4444" } : {}}
              />
              {errores.password && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.password}
                </span>
              )}
            </div>
            {/* Rol */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                style={errores.rol ? { borderColor: "#ef4444" } : {}}
              >
                <option value="">Seleccionar rol</option>
                <option value="ADMIN">ADMIN</option>
                <option value="DUENO">DUEÑO</option>
                <option value="EMPLEADO">EMPLEADO</option>
              </select>
              {errores.rol && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.rol}
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
            {editando ? (
              <button className="btn-green" onClick={actualizarUsuario}>
                Actualizar Usuario
              </button>
            ) : (
              <button className="btn-green" onClick={guardarUsuario}>
                Registrar Usuario
              </button>
            )}
            <button
              className="btn-light"
              onClick={() => {
                setEditando(null);
                setForm({
                  nombre: "",
                  email: "",
                  password: "",
                  rol: "",
                  estado: 1
                });
                setErrores({});
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
        <div className="card search-card">
          <h3>Buscar Usuario</h3>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <h3>Lista de Usuarios</h3>
        </div>
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u, i) => {
              let badgeRol = "";
              if (u.rol === "ADMIN") badgeRol = "badge-admin";
              if (u.rol === "DUENO") badgeRol = "badge-dueno";
              if (u.rol === "EMPLEADO") badgeRol = "badge-empleado";
              return (
                <tr key={u.id_usuario}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="user-info">
                      <div className="avatar">
                        {u.nombre ? u.nombre.charAt(0) : "U"}
                      </div>
                      {u.nombre}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${badgeRol}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor: u.estado ? "#d1fae5" : "#fee2e2",
                      color: u.estado ? "#065f46" : "#991b1b"
                    }}>
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => editarUsuario(u)}>
                      ✏️
                    </button>
                    <button className="btn-delete" onClick={() => iniciarEliminacion(u)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal de React para confirmar la eliminación de un usuario */}
      {usuarioParaEliminar && (
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
              ¿Eliminar Usuario?
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              ¿Está seguro que desea eliminar al usuario <strong>{usuarioParaEliminar.nombre}</strong>?<br />
              Esta acción es permanente y no se podrá revertir.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setUsuarioParaEliminar(null)}
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
