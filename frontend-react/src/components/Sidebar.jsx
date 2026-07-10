import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Sidebar() {
    const navigate = useNavigate();
    const { user, logout: logoutUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const logout = () => {
        logoutUser();
        navigate("/login");
    };

    const rol = user && user.rol ? user.rol.toUpperCase() : "";

    const mostrarLink = (routeRol) => {
        if (!rol) return false;
        if (rol === "ADMIN") return true; // El ADMIN ve todo
        if (rol === "DUENO") {
            // El DUEÑO ve casi todo (todo excepto Usuarios y Auditoría)
            return !["usuarios", "auditoria"].includes(routeRol);
        }
        if (rol === "EMPLEADO") {
            // El EMPLEADO solo ve cotizacion, trabajos, progreso, perfil
            return ["cotizacion", "trabajos", "progreso", "perfil"].includes(routeRol);
        }
        return false;
    };

    return (
        <>
            <button 
                className="sidebar-toggle" 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    top: "15px",
                    left: "15px",
                    zIndex: 1000,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#1F3D2B",
                    color: "white",
                    fontSize: "20px",
                    display: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                {isOpen ? "✕" : "☰"}
            </button>
            <div className={`sidebar ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)}>
                <h2>🪑 Muebles</h2>
                <div className="menu">
                {mostrarLink("inicio") && (
                    <NavLink to="/">
                        🏠 Inicio
                    </NavLink>
                )}

                {mostrarLink("usuarios") && (
                    <NavLink to="/usuarios">
                        👥 Usuarios
                    </NavLink>
                )}

                {mostrarLink("clientes") && (
                    <NavLink to="/clientes">
                        🧑‍💼 Clientes
                    </NavLink>
                )}

                {mostrarLink("proveedores") && (
                    <NavLink to="/proveedores">
                        🚚 Proveedores
                    </NavLink>
                )}

                {mostrarLink("tableros") && (
                    <NavLink to="/tableros">
                        🪵 Tableros
                    </NavLink>
                )}

                {mostrarLink("accesorios") && (
                    <NavLink to="/accesorios">
                        🔩 Accesorios
                    </NavLink>
                )}

                {mostrarLink("cotizacion") && (
                    <NavLink to="/cotizacion">
                        💰 Nueva cotización
                    </NavLink>
                )}

                {mostrarLink("trabajos") && (
                    <NavLink to="/trabajos">
                        📋 Cotizaciones
                    </NavLink>
                )}

                {mostrarLink("progreso") && (
                    <NavLink to="/progreso">
                        📊 Trabajos
                    </NavLink>
                )}

                {mostrarLink("reportes") && (
                    <NavLink to="/reportes">
                        📈 Reportes
                    </NavLink>
                )}

                {mostrarLink("auditoria") && (
                    <NavLink to="/auditoria">
                        📋 Auditoría
                    </NavLink>
                )}

                {mostrarLink("perfil") && (
                    <NavLink to="/perfil">
                        👤 Perfil
                    </NavLink>
                )}

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    🚪 Cerrar sesión
                </button>
            </div>
        </div>
        </>
    );
}

export default Sidebar;