import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("usuario");

        navigate("/login");

    };

    return (

        <div className="sidebar">

            <h2>🪑 Muebles</h2>

            <div className="menu">

                <NavLink to="/">
                    🏠 Inicio
                </NavLink>

                <NavLink to="/usuarios">
                    👥 Usuarios
                </NavLink>

                <NavLink to="/clientes">
                    🧑‍💼 Clientes
                </NavLink>

                <NavLink to="/proveedores">
                    🚚 Proveedores
                </NavLink>

                <NavLink to="/tableros">
                    🪵 Tableros
                </NavLink>

                <NavLink to="/accesorios">
                    🔩 Accesorios
                </NavLink>

                <NavLink to="/cotizacion">
                    💰 Cotización
                </NavLink>

                <NavLink to="/trabajos">
                    📋 Trabajos
                </NavLink>

                <NavLink to="/progreso">
                    📊 Progreso
                </NavLink>

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