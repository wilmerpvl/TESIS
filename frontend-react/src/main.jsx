import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./css/style.css";
import "./css/dashboard.css";
import "./css/login.css";
import "./css/usuarios.css";
import "./css/clientes.css";
import "./css/proveedores.css";
import "./css/materiales.css";
import "./css/accesorios.css";
import "./css/cotizacion.css";
import "./css/progreso.css";
import "./css/trabajos.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <React.StrictMode>

        <App />

    </React.StrictMode>

);