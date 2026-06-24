import { useEffect, useState } from "react";
import {
    obtenerPerfil,
    actualizarPerfil
} from "../services/cotizacionService";

export default function Perfil() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const [perfil, setPerfil] = useState(null);
    const [password, setPassword] = useState("");
    const [errores, setErrores] = useState({});
    const [alerta, setAlerta] = useState(null); // { mensaje: "...", tipo: "success" | "error" }

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const data = await obtenerPerfil(usuario.id || usuario.id_usuario);
            setPerfil(data);
        } catch (error) {
            console.error("Error al obtener el perfil:", error);
        }
    };

    const validarFormulario = () => {
        let nuevosErrores = {};

        if (!perfil.nombre || !perfil.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (perfil.nombre.trim().length < 3) {
            nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
        }

        if (!perfil.email || !perfil.email.trim()) {
            nuevosErrores.email = "El correo electrónico es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email.trim())) {
            nuevosErrores.email = "Ingrese un correo electrónico válido.";
        }

        if (password.trim() && password.trim().length < 4) {
            nuevosErrores.password = "La contraseña debe tener al menos 4 caracteres.";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const guardar = async () => {
        if (!validarFormulario()) return;

        try {
            const datosEnviar = {
                nombre: perfil.nombre.trim(),
                email: perfil.email.trim(),
                password: password.trim() ? password.trim() : undefined
            };

            const res = await actualizarPerfil(usuario.id || usuario.id_usuario, datosEnviar);

            if (res.mensaje || res.message) {
                // Actualizar el nombre y email en el localStorage para que se refleje en todo el sistema
                const usuarioActualizado = {
                    ...usuario,
                    nombre: perfil.nombre.trim(),
                    email: perfil.email.trim()
                };
                localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

                setAlerta({
                    mensaje: res.mensaje || res.message || "Perfil actualizado correctamente.",
                    tipo: "success"
                });
                setPassword("");
                setErrores({});
                cargarPerfil();
            } else {
                setAlerta({
                    mensaje: res.mensaje || "Error al actualizar el perfil.",
                    tipo: "error"
                });
            }
        } catch (error) {
            console.error(error);
            setAlerta({
                mensaje: error.response?.data?.mensaje || "Error de red al actualizar el perfil.",
                tipo: "error"
            });
        }
    };

    const getAvatarColor = (rol) => {
        if (!rol) return "#3b82f6";
        switch (rol.toUpperCase()) {
            case "ADMIN": return "#15803d";
            case "DUENO": return "#2563eb";
            case "EMPLEADO": return "#8b5cf6";
            default: return "#475569";
        }
    };

    if (!perfil) return null;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <div className="icon-box">👤</div>
                    <div>
                        <h1>Mi Perfil</h1>
                        <p>Información personal y de acceso al sistema</p>
                    </div>
                </div>
                <div className="breadcrumb">Inicio / Perfil</div>
            </div>

            <div className="perfil-layout">
                {/* Lateral: Resumen */}
                <div className="perfil-sidebar-card">
                    <div className="perfil-avatar-large" style={{ backgroundColor: getAvatarColor(perfil.rol) }}>
                        {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : "?"}
                    </div>
                    <h2 className="perfil-nombre-title">{perfil.nombre}</h2>
                    <p className="perfil-email-subtitle">{perfil.email}</p>
                    
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px", width: "100%", alignItems: "center" }}>
                        <span className={`badge badge-${perfil.rol.toLowerCase()}`} style={{ fontSize: "14px", padding: "8px 16px" }}>
                            Rol: {perfil.rol}
                        </span>
                        <span className="badge badge-activo" style={{ 
                            fontSize: "14px", 
                            padding: "8px 16px", 
                            backgroundColor: perfil.estado ? "#dcfce7" : "#fee2e2", 
                            color: perfil.estado ? "#15803d" : "#b91c1c" 
                        }}>
                            Estado: {perfil.estado ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <div className="perfil-form-card">
                    <h3 className="perfil-section-title">
                        <span>📝</span> Datos Personales
                    </h3>
                    
                    <div className="perfil-form-grid">
                        <div className="perfil-form-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                value={perfil.nombre}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, nombre: e.target.value });
                                    if (errores.nombre) setErrores({ ...errores, nombre: "" });
                                }}
                                className={errores.nombre ? "input-error" : ""}
                            />
                            {errores.nombre && <span className="error-text">{errores.nombre}</span>}
                        </div>

                        <div className="perfil-form-group">
                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                value={perfil.email}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, email: e.target.value });
                                    if (errores.email) setErrores({ ...errores, email: "" });
                                }}
                                className={errores.email ? "input-error" : ""}
                            />
                            {errores.email && <span className="error-text">{errores.email}</span>}
                        </div>
                    </div>

                    <h3 className="perfil-section-title" style={{ marginTop: "30px" }}>
                        <span>🔒</span> Seguridad de la Cuenta
                    </h3>

                    <div className="perfil-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="perfil-form-group">
                            <label>Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="Dejar vacío para conservar la contraseña actual"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errores.password) setErrores({ ...errores, password: "" });
                                }}
                                className={errores.password ? "input-error" : ""}
                            />
                            {errores.password && <span className="error-text">{errores.password}</span>}
                        </div>
                    </div>

                    <div className="perfil-form-actions">
                        <button className="btn-green" onClick={guardar}>
                            💾 Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de React para Alertas */}
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
                            {alerta.tipo === "success" ? "✅" : "❌"}
                        </div>

                        <h3 style={{ 
                            margin: 0, 
                            fontSize: "18px", 
                            fontWeight: "bold", 
                            color: alerta.tipo === "success" ? "#10b981" : "#ef4444"
                        }}>
                            {alerta.tipo === "success" ? "Operación Exitosa" : "Error"}
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
                                    backgroundColor: alerta.tipo === "success" ? "#10b981" : "#ef4444",
                                    color: "white"
                                }}
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