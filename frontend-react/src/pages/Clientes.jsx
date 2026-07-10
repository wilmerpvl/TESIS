import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/clientes.css";
export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [buscar, setBuscar] = useState("");
    const [form, setForm] = useState({
        nombre: "",
        identificacion: "",
        telefono: "",
        correo: "",
        direccion: "",
        estado: 1
    });
    
    // Estado para guardar los mensajes de validación de los inputs
    const [errores, setErrores] = useState({});
    const [editando, setEditando] = useState(null);
    // Estado para manejar el modal personalizado de confirmación de eliminación
    const [clienteParaEliminar, setClienteParaEliminar] = useState(null);
    // Estado para manejar alertas personalizadas (reemplazo de window.alert)
    const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" | "warning" }
    useEffect(() => {
        cargarClientes();
    }, []);
    async function cargarClientes() {
        try {
            const res = await api.get("/clientes");
            setClientes(res.data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    }
    function handleChange(e) {
        let value = e.target.value;
        if (e.target.name === "nombre") {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
        } else if (e.target.name === "identificacion") {
            value = value.replace(/\D/g, "").slice(0, 13);
        } else if (e.target.name === "telefono") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        setForm({
            ...form,
            [e.target.name]: value
        });
        
        // Limpiar el error de este campo al escribir
        if (errores[e.target.name]) {
            setErrores({
                ...errores,
                [e.target.name]: ""
            });
        }
    }
    const handleKeyPressOnlyLetters = (e) => {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
            e.preventDefault();
        }
    };
    const handleKeyPressOnlyNumbers = (e) => {
        if (!/[0-9]/.test(e.key)) {
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
        const regexNumero = /^[0-9]+$/;
        // Validar Nombre
        if (!form.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (form.nombre.trim().length < 3) {
            nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
        }
        // Validar Identificación (Cédula o RUC)
        if (!form.identificacion.trim()) {
            nuevosErrores.identificacion = "La identificación es obligatoria.";
        } else if (!regexNumero.test(form.identificacion.trim())) {
            nuevosErrores.identificacion = "Debe contener únicamente números.";
        } else if (form.identificacion.trim().length !== 10 && form.identificacion.trim().length !== 13) {
            nuevosErrores.identificacion = "Debe tener 10 dígitos (Cédula) o 13 dígitos (RUC).";
        }
        // Validar Teléfono
        if (!form.telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es obligatorio.";
        } else if (!/^[0-9\s+-]+$/.test(form.telefono.trim())) {
            nuevosErrores.telefono = "Formato de teléfono no válido.";
        } else if (form.telefono.trim().replace(/\D/g, "").length < 7) {
            nuevosErrores.telefono = "Debe tener mínimo 7 dígitos.";
        }
        // Validar Correo (Opcional, pero si se escribe debe tener formato válido)
        if (form.correo.trim()) {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(form.correo.trim())) {
                nuevosErrores.correo = "Ingrese un formato de correo electrónico válido.";
            }
        }
        // Validar Dirección
        if (!form.direccion.trim()) {
            nuevosErrores.direccion = "La dirección es obligatoria.";
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };
    async function guardarCliente() {
        if (!validarFormulario()) {
            return;
        }
        // Obtener el ID del usuario logueado desde localStorage
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = usuario ? (usuario.id || usuario.id_usuario) : null;
        
        // Crear el objeto de datos a enviar incluyendo el id_usuario
        const datosEnviar = {
            ...form,
            id_usuario
        };
        try {
            if (editando) {
                await api.put(`/clientes/${editando}`, datosEnviar);
            } else {
                await api.post("/clientes", datosEnviar);
            }
            setAlerta({
                mensaje: editando ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.",
                tipo: "success"
            });
            setForm({
                nombre: "",
                identificacion: "",
                telefono: "",
                correo: "",
                direccion: "",
                estado: 1
            });
            setErrores({});
            setEditando(null);
            cargarClientes();
        } catch (error) {
            console.error(error);
            setAlerta({
                mensaje: error.response?.data?.mensaje || "Error de conexión al guardar el cliente.",
                tipo: "error"
            });
        }
    }
    // Abre el modal de confirmación de eliminación
    const iniciarEliminacion = (cliente) => {
        setClienteParaEliminar(cliente);
    };
    // Confirma la eliminación tras la interacción en el modal
    const confirmarEliminarCliente = async () => {
        if (!clienteParaEliminar) return;
        
        const id = clienteParaEliminar.id_cliente;
        setClienteParaEliminar(null); // Cerrar modal de confirmación
        // Obtener el ID del usuario logueado desde localStorage
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = usuario ? (usuario.id || usuario.id_usuario) : null;
        try {
            const res = await api.delete(`/clientes/${id}`, {
                params: { id_usuario }
            });
            setAlerta({
                mensaje: res.data?.mensaje || "Cliente eliminado con éxito.",
                tipo: "success"
            });
            cargarClientes();
        } catch (error) {
            console.error(error);
            setAlerta({
                mensaje: error.response?.data?.mensaje || "Error al intentar eliminar el cliente.",
                tipo: "warning"
            });
        }
    };
    const activarClienteDirecto = async (cliente) => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const id_usuario = usuario ? (usuario.id || usuario.id_usuario) : null;
        const datosEnviar = {
            nombre: cliente.nombre,
            identificacion: cliente.identificacion,
            telefono: cliente.telefono,
            correo: cliente.correo,
            direccion: cliente.direccion,
            id_usuario,
            estado: 1
        };
        try {
            await api.put(`/clientes/${cliente.id_cliente}`, datosEnviar);
            setAlerta({
                mensaje: "Cliente activado correctamente.",
                tipo: "success"
            });
            cargarClientes();
        } catch (error) {
            console.error(error);
            setAlerta({
                mensaje: "Error al activar el cliente.",
                tipo: "error"
            });
        }
    };
    function editarCliente(cliente) {
        setForm({
            nombre: cliente.nombre,
            identificacion: cliente.identificacion,
            telefono: cliente.telefono,
            correo: cliente.correo,
            direccion: cliente.direccion,
            estado: cliente.estado ? 1 : 0
        });
        setErrores({}); // Limpiar errores previos
        setEditando(cliente.id_cliente);
    }
    const clientesFiltrados = clientes.filter(c =>
        Object.values(c)
            .join(" ")
            .toLowerCase()
            .includes(buscar.toLowerCase())
    );
    return (
        <>
            <div className="page-header">
                <div className="page-title">
                    <div className="icon-box">👥</div>
                    <div>
                        <h1>Clientes</h1>
                        <p>Gestiona los clientes</p>
                    </div>
                </div>
            </div>
            <div className="crud-top">
                <div className="card form-card">
                    <h3>{editando ? "Editar Cliente" : "Nuevo Cliente"}</h3>
                    <div className="form-grid">
                        {/* Nombre */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <input
                                name="nombre"
                                placeholder="Nombre"
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
                        {/* Identificación */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <input
                                name="identificacion"
                                placeholder="Cédula / RUC"
                                value={form.identificacion}
                                onChange={handleChange}
                                onKeyPress={handleKeyPressOnlyNumbers}
                                maxLength={13}
                                style={errores.identificacion ? { borderColor: "#ef4444" } : {}}
                            />
                            {errores.identificacion && (
                                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                                    {errores.identificacion}
                                </span>
                            )}
                        </div>
                        {/* Teléfono */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <input
                                name="telefono"
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChange={handleChange}
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
                        {/* Correo */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <input
                                name="correo"
                                placeholder="Correo (Opcional)"
                                value={form.correo}
                                onChange={handleChange}
                                style={errores.correo ? { borderColor: "#ef4444" } : {}}
                            />
                            {errores.correo && (
                                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                                    {errores.correo}
                                </span>
                            )}
                        </div>
                        {/* Dirección */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <input
                                name="direccion"
                                placeholder="Dirección"
                                value={form.direccion}
                                onChange={handleChange}
                                style={errores.direccion ? { borderColor: "#ef4444" } : {}}
                            />
                            {errores.direccion && (
                                <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>
                                    {errores.direccion}
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
                        <button className="btn-green" onClick={guardarCliente}>
                            {editando ? "Actualizar Cliente" : "Registrar Cliente"}
                        </button>
                        <button
                            className="btn-light"
                            onClick={() => {
                                setEditando(null);
                                setForm({
                                    nombre: "",
                                    identificacion: "",
                                    telefono: "",
                                    correo: "",
                                    direccion: "",
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
                    <h3>Buscar Cliente</h3>
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
                    <h3>Lista de Clientes</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Identificación</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((c, i) => (
                            <tr key={c.id_cliente}>
                                <td>{i + 1}</td>
                                <td>
                                    <div className="user-info">
                                        <div className="avatar">
                                            {c.nombre.charAt(0)}
                                        </div>
                                        {c.nombre}
                                    </div>
                                </td>
                                <td>{c.identificacion}</td>
                                <td>{c.telefono}</td>
                                <td>{c.correo}</td>
                                <td>{c.direccion}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        backgroundColor: c.estado ? "#d1fae5" : "#fee2e2",
                                        color: c.estado ? "#065f46" : "#991b1b"
                                    }}>
                                        {c.estado ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => editarCliente(c)}
                                    >
                                        ✏️
                                    </button>
                                    {c.estado ? (
                                        <button
                                            className="btn-delete"
                                            onClick={() => iniciarEliminacion(c)}
                                            title="Inactivar"
                                        >
                                            🗑️
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-green"
                                            onClick={() => activarClienteDirecto(c)}
                                            title="Activar"
                                            style={{
                                                padding: "6px 10px",
                                                fontSize: "13px",
                                                fontWeight: "bold",
                                                borderRadius: "6px",
                                                display: "inline-flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            ✔️
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal de React para confirmar la eliminación de un cliente (Reemplazo de window.confirm) */}
            {clienteParaEliminar && (
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
                            ¿Eliminar Cliente?
                        </h3>
                        
                        <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                            ¿Está seguro que desea eliminar a <strong>{clienteParaEliminar.nombre}</strong>?<br />
                            Esta acción es permanente y no se podrá revertir.
                        </p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                            <button 
                                className="btn-light" 
                                onClick={() => setClienteParaEliminar(null)}
                                style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-delete" 
                                onClick={confirmarEliminarCliente}
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
                    zIndex: 1100 // Mayor Z-Index para sobresalir por encima de todo
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
