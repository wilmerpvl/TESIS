import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("usuario");
        navigate("/login");
    };

    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const rol = usuario && usuario.rol ? usuario.rol.toUpperCase() : "";

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
        <div className="sidebar">
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
    );
}

export default Sidebar;