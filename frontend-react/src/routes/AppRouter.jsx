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

import DashboardLayout from "../layout/DashboardLayout";

function RutaProtegida({ children }) {

    const usuario = localStorage.getItem(
        "usuario"
    );

    return usuario
        ? children
        : <Navigate to="/login" />;

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
                        element={<Inicio />}
                    />

                    <Route
                        path="usuarios"
                        element={<Usuarios />}
                    />

                    <Route
                        path="clientes"
                        element={<Clientes />}
                    />

                    <Route
                        path="proveedores"
                        element={<Proveedores />}
                    />

                    <Route
                        path="tableros"
                        element={<Tableros />}
                    />

                    <Route
                        path="accesorios"
                        element={<Accesorios />}
                    />

                    <Route
                        path="cotizacion"
                        element={<Cotizacion />}
                    />

                    <Route
                        path="trabajos"
                        element={<Trabajos />}
                    />

                    <Route
                        path="progreso"
                        element={<Progreso />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default AppRouter;