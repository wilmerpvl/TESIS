import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "../pages/Login";
import Inicio from "../pages/Inicio";

import Usuarios from "../pages/Usuarios";
import Clientes from "../pages/Clientes";
import Proveedores from "../pages/Proveedores";
import Tableros from "../pages/Tableros";
import Accesorios from "../pages/Accesorios";
import Cotizacion from "../pages/Cotizacion";
import Trabajos from "../pages/Trabajos";
import Progreso from "../pages/Progreso";
import Perfil from "../pages/Perfil";
import Reportes from "../pages/Reportes";
import Auditoria from "../pages/Auditoria";

import DashboardLayout from "../layout/DashboardLayout";

function RutaProtegida({ children }) {
    const usuario = localStorage.getItem("usuario");
    return usuario ? children : <Navigate to="/login" replace />;
}

function RutaPermitida({ allowedRoles, children }) {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return <Navigate to="/login" replace />;

    const usuario = JSON.parse(usuarioStr);
    const rol = usuario.rol ? usuario.rol.toUpperCase() : "";

    if (!allowedRoles.includes(rol)) {
        if (rol === "EMPLEADO") {
            return <Navigate to="/cotizacion" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/"
                    element={
                        <RutaProtegida>
                            <DashboardLayout />
                        </RutaProtegida>
                    }
                >
                    <Route
                        index
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Inicio />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="usuarios"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN"]}>
                                <Usuarios />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="clientes"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Clientes />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="proveedores"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Proveedores />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="tableros"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Tableros />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="accesorios"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Accesorios />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="cotizacion"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <Cotizacion />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="trabajos"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <Trabajos />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="progreso"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <Progreso />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="/perfil"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <Perfil />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="/reportes"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO"]}>
                                <Reportes />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="/auditoria"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN"]}>
                                <Auditoria />
                            </RutaPermitida>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;