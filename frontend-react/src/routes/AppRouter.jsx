import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Inicio from "../pages/Inicio";

import Usuarios from "../pages/Usuarios";
import Clientes from "../pages/Clientes";
import Proveedores from "../pages/Proveedores";
import Tableros from "../pages/Tableros";
import Accesorios from "../pages/Accesorios";
import NuevaCotizacion from "../pages/NuevaCotizacion";
import Cotizaciones from "../pages/Cotizaciones";
import Trabajos from "../pages/Trabajos";
import Perfil from "../pages/Perfil";
import Reportes from "../pages/Reportes";
import Auditoria from "../pages/Auditoria";

import DashboardLayout from "../layout/DashboardLayout";

function RutaProtegida({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

function RutaPermitida({ allowedRoles, children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;

    const rol = user.rol ? user.rol.toUpperCase() : "";

    if (!allowedRoles.includes(rol)) {
        if (rol === "EMPLEADO") {
            return <Navigate to="/nueva-cotizacion" replace />;
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
                        path="nueva-cotizacion"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <NuevaCotizacion />
                            </RutaPermitida>
                        }
                    />

                    <Route
                        path="cotizaciones"
                        element={
                            <RutaPermitida allowedRoles={["ADMIN", "DUENO", "EMPLEADO"]}>
                                <Cotizaciones />
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