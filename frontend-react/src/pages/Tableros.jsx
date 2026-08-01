import { useEffect, useState } from "react";
import api from "../services/api";
import ActionMenu from "../components/ActionMenu";
import {
  obtenerTableros,
  crearTablero,
  actualizarTablero,
  eliminarTablero
} from "../services/tablerosService";
function Tableros() {
  const [tableros, setTableros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  // Estados para validaciones y modales
  const [errores, setErrores] = useState({});
  const [tableroParaEliminar, setTableroParaEliminar] = useState(null);
  const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" | "warning" }
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    color: "",
    textura: "",
    ancho: "",
    alto: "",
    espesor: "",
    precio_tablero: "",
    costo_corte: "",
    id_proveedor: "",
    estado: 1,
    imagen: null
  });
  useEffect(() => {
    cargarDatos();
    cargarProveedores();
  }, []);
  const cargarDatos = async () => {
    try {
      const data = await obtenerTableros();
      setTableros(data);
    } catch (error) {
      console.error("Error al cargar tableros:", error);
    }
  };
  const cargarProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };
  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      tipo: "",
      color: "",
      textura: "",
      ancho: "",
      alto: "",
      espesor: "",
      precio_tablero: "",
      costo_corte: "",
      id_proveedor: "",
      estado: 1,
      imagen: null
    });
    setEditando(null);
    setErrores({});
    // Reset file input value
    const fileInput = document.querySelector('input[type="file"][name="imagen"]');
    if (fileInput) fileInput.value = "";
  };
  const handleChange = (e) => {
    let value = e.target.value;
    if (["nombre", "color", "textura"].includes(e.target.name)) {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    }
    setForm({
      ...form,
      [e.target.name]: value
    });
    // Limpiar el error del campo correspondiente
    if (errores[e.target.name]) {
      setErrores({
        ...errores,
        [e.target.name]: ""
      });
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setForm({
        ...form,
        imagen: e.target.files[0]
      });
    }
  };
  const handleKeyPressDecimals = (e) => {
    if (!/[0-9.]/.test(e.key)) {
      e.preventDefault();
    }
    if (e.key === "." && e.target.value.includes(".")) {
      e.preventDefault();
    }
  };
  const handleKeyPressOnlyLetters = (e) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
      e.preventDefault();
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
    if (!form.tipo) {
      nuevosErrores.tipo = "El tipo de tablero es obligatorio.";
    }
    if (!form.ancho || isNaN(form.ancho) || parseFloat(form.ancho) <= 0) {
      nuevosErrores.ancho = "Debe ser mayor a 0.";
    }
    if (!form.alto || isNaN(form.alto) || parseFloat(form.alto) <= 0) {
      nuevosErrores.alto = "Debe ser mayor a 0.";
    }
    if (!form.espesor || isNaN(form.espesor) || parseFloat(form.espesor) <= 0) {
      nuevosErrores.espesor = "Debe ser mayor a 0.";
    }
    if (form.precio_tablero === "" || isNaN(form.precio_tablero) || parseFloat(form.precio_tablero) < 0) {
      nuevosErrores.precio_tablero = "Debe ser un precio válido.";
    }
    if (form.costo_corte === "" || isNaN(form.costo_corte) || parseFloat(form.costo_corte) < 0) {
      nuevosErrores.costo_corte = "Debe ser un costo válido.";
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
      
      const datosEnviar = {
        ...form,
        id_usuario // Adjuntamos id_usuario para auditoría
      };
      if (editando) {
        await actualizarTablero(editando, datosEnviar);
        setAlerta({
          mensaje: "Tablero actualizado correctamente.",
          tipo: "success"
        });
      } else {
        await crearTablero(datosEnviar);
        setAlerta({
          mensaje: "Tablero registrado correctamente.",
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
  const activarTableroDirecto = async (tablero) => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
    const datosEnviar = {
      nombre: tablero.nombre,
      tipo: tablero.tipo,
      color: tablero.color || "",
      textura: tablero.textura || "",
      ancho: tablero.ancho,
      alto: tablero.alto,
      espesor: tablero.espesor,
      precio_tablero: tablero.precio_tablero || tablero.precio_tablon || "",
      costo_corte: tablero.costo_corte,
      id_proveedor: tablero.id_proveedor || "",
      id_usuario,
      estado: 1
    };
    try {
      await actualizarTablero(tablero.id_tablero, datosEnviar);
      setAlerta({
        mensaje: "Tablero activado correctamente.",
        tipo: "success"
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: "Error al activar el tablero.",
        tipo: "error"
      });
    }
  };
  const editar = (tablero) => {
    setForm({
      nombre: tablero.nombre,
      tipo: tablero.tipo,
      color: tablero.color || "",
      textura: tablero.textura || "",
      ancho: tablero.ancho,
      alto: tablero.alto,
      espesor: tablero.espesor,
      precio_tablero: tablero.precio_tablero || tablero.precio_tablon || "",
      costo_corte: tablero.costo_corte,
      id_proveedor: tablero.id_proveedor || "",
      estado: tablero.estado ? 1 : 0
    });
    setEditando(tablero.id_tablero);
    setErrores({});
  };
  const iniciarEliminacion = (tablero) => {
    setTableroParaEliminar(tablero);
  };
  const confirmarEliminar = async () => {
    if (!tableroParaEliminar) return;
    const id = tableroParaEliminar.id_tablero;
    setTableroParaEliminar(null); // Cerrar modal
    try {
      // Obtener el ID del usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      const id_usuario = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado.id_usuario) : null;
      const data = await eliminarTablero(id, id_usuario);
      setAlerta({
        mensaje: data.mensaje || "Tablero eliminado con éxito.",
        tipo: "success"
      });
      cargarDatos();
    } catch (error) {
      console.error(error);
      setAlerta({
        mensaje: error.response?.data?.mensaje || "Error al intentar eliminar el tablero.",
        tipo: "warning"
      });
    }
  };
  const filtrados = tableros.filter((t) =>
    Object.values(t)
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <div className="icon-box">🪵</div>
          <div>
            <h1>Tableros</h1>
            <p>Gestión de materiales y tableros</p>
          </div>
        </div>
        <div className="breadcrumb">Inicio / Tableros</div>
      </div>
      <div className="crud-top">
        <div className="card form-card">
          <h3>{editando ? "Editar Tablero" : "Nuevo Tablero"}</h3>
          
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div className="form-section-title">
            <span>📌 Información General</span>
            <span className="form-section-badge">Paso 1</span>
          </div>
          <div className="form-grid">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="nombre"
                placeholder="Nombre del tablero"
                value={form.nombre}
                onChange={handleChange}
                onKeyPress={handleKeyPressOnlyLetters}
                style={errores.nombre ? { borderColor: "#ef4444" } : {}}
              />
              {errores.nombre && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.nombre}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                style={errores.tipo ? { borderColor: "#ef4444" } : {}}
              >
                <option value="">Seleccionar tipo</option>
                <option value="MELAMINA">Melamina</option>
                <option value="MDF">MDF</option>
                <option value="TRIPLEX">Triplex</option>
              </select>
              {errores.tipo && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.tipo}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="color"
                placeholder="Color"
                value={form.color}
                onChange={handleChange}
                onKeyPress={handleKeyPressOnlyLetters}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="textura"
                placeholder="Textura"
                value={form.textura}
                onChange={handleChange}
                onKeyPress={handleKeyPressOnlyLetters}
              />
            </div>
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
                  .map((prov) => (
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
          </div>

          {/* SECCIÓN 2: DIMENSIONES Y ESPECIFICACIONES */}
          <div className="form-section-title">
            <span>📏 Dimensiones y Especificaciones</span>
            <span className="form-section-badge">Paso 2</span>
          </div>
          <div className="form-grid">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="ancho"
                type="number"
                step="any"
                placeholder="Ancho (m/cm)"
                value={form.ancho}
                onChange={handleChange}
                onKeyPress={handleKeyPressDecimals}
                style={errores.ancho ? { borderColor: "#ef4444" } : {}}
              />
              {errores.ancho && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.ancho}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="alto"
                type="number"
                step="any"
                placeholder="Alto (m/cm)"
                value={form.alto}
                onChange={handleChange}
                onKeyPress={handleKeyPressDecimals}
                style={errores.alto ? { borderColor: "#ef4444" } : {}}
              />
              {errores.alto && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.alto}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="espesor"
                type="number"
                step="any"
                placeholder="Espesor (mm)"
                value={form.espesor}
                onChange={handleChange}
                onKeyPress={handleKeyPressDecimals}
                style={errores.espesor ? { borderColor: "#ef4444" } : {}}
              />
              {errores.espesor && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.espesor}
                </span>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: PRECIOS Y COSTOS */}
          <div className="form-section-title">
            <span>💰 Precios y Costos</span>
            <span className="form-section-badge">Paso 3</span>
          </div>
          <div className="form-grid">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="precio_tablero"
                type="number"
                step="any"
                placeholder="Precio Tablero ($)"
                value={form.precio_tablero}
                onChange={handleChange}
                onKeyPress={handleKeyPressDecimals}
                style={errores.precio_tablero ? { borderColor: "#ef4444" } : {}}
              />
              {errores.precio_tablero && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.precio_tablero}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                name="costo_corte"
                type="number"
                step="any"
                placeholder="Costo corte ($)"
                value={form.costo_corte}
                onChange={handleChange}
                onKeyPress={handleKeyPressDecimals}
                style={errores.costo_corte ? { borderColor: "#ef4444" } : {}}
              />
              {errores.costo_corte && (
                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                  {errores.costo_corte}
                </span>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: IMAGEN Y ESTADO */}
          <div className="form-section-title">
            <span>🖼️ Imagen y Estado</span>
            <span className="form-section-badge">Paso 4</span>
          </div>
          <div className="form-grid">
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  padding: "10px",
                  border: "1px solid #dcdfe4",
                  borderRadius: "10px",
                  fontSize: "14px"
                }}
              />
            </div>
            {form.imagen && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 2" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>✓ Imagen seleccionada: {form.imagen.name}</span>
                <button type="button" className="btn-light" style={{ padding: "4px 8px", fontSize: "11px", height: "auto" }} onClick={() => setForm({ ...form, imagen: null })}>Quitar</button>
              </div>
            )}
            {editando && tableros.find(t => t.id_tablero === editando)?.imagen && !form.imagen && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 2" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Imagen actual:</span>
                <img
                  src={`${api.defaults.baseURL.replace("/api", "")}/uploads/${tableros.find(t => t.id_tablero === editando).imagen}`}
                  alt="Actual"
                  style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                />
              </div>
            )}
          </div>

          <div className="crud-actions">
            <button className="btn-green" onClick={guardar}>
              {editando ? "Actualizar Tablero" : "Guardar Tablero"}
            </button>
            <button className="btn-light" onClick={limpiarFormulario}>
              Limpiar
            </button>
          </div>
        </div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <h3>Lista de Tableros</h3>
          <div className="table-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar tablero..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Color</th>
              <th>Textura</th>
              <th>Medidas</th>
              <th>Espesor</th>
              <th>Proveedor</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((t, i) => (
              <tr key={t.id_tablero}>
                <td>{i + 1}</td>
                <td>
                  {t.imagen ? (
                    <img
                      src={`${api.defaults.baseURL.replace("/api", "")}/uploads/${t.imagen}`}
                      alt={t.nombre}
                      style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    <span style={{ fontSize: "20px" }}>🪵</span>
                  )}
                </td>
                <td>{t.nombre}</td>
                <td>{t.tipo}</td>
                <td>{t.color || "-"}</td>
                <td>{t.textura || "-"}</td>
                <td>{t.ancho} x {t.alto}</td>
                <td>{t.espesor} mm</td>
                <td>{t.proveedor || "-"}</td>
                <td>${Number(t.precio_tablero || t.precio_tablon || 0).toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: t.estado ? "#d1fae5" : "#fee2e2",
                    color: t.estado ? "#065f46" : "#991b1b"
                  }}>
                    {t.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="actions">
                  <ActionMenu
                    estado={t.estado}
                    onEdit={() => editar(t)}
                    onDelete={() => iniciarEliminacion(t)}
                    onActivate={() => activarTableroDirecto(t)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tableroParaEliminar && (
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
              ¿Eliminar Tablero?
            </h3>
            
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              ¿Está seguro que desea eliminar el tablero <strong>{tableroParaEliminar.nombre}</strong>?<br />
              Esta acción es permanente y no se podrá revertir.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <button 
                className="btn-light" 
                onClick={() => setTableroParaEliminar(null)}
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
export default Tableros;