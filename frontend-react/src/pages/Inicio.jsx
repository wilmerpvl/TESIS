import { useEffect, useState } from "react";

import {
    obtenerDashboard
}
    from "../services/cotizacionService";

function Inicio() {

    const [usuario, setUsuario] =
        useState(null);

    const [dashboard, setDashboard] =
        useState(null);

    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("usuario")
        );

        setUsuario(user);

        cargarDashboard();

    }, []);

    const cargarDashboard =
        async () => {

            try {

                const data =
                    await obtenerDashboard();

                setDashboard(data);

            }
            catch (error) {

                console.error(error);

            }

        };

    return (

        <>

            <div className="page-header">

                <div className="page-title">

                    <div className="icon-box">
                        🏠
                    </div>

                    <div>

                        <h1>
                            Inicio
                        </h1>

                        <p>
                            Panel principal del sistema
                        </p>

                    </div>

                </div>

            </div>

            <div className="card">

                <h2>
                    Bienvenido,
                    {" "}
                    {usuario?.nombre}
                </h2>

                <p
                    style={{
                        marginTop: "10px"
                    }}
                >

                    Rol:
                    {" "}
                    {usuario?.rol}

                </p>

            </div>

            {dashboard && (

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(220px,1fr))",
                        gap: "20px",
                        marginTop: "20px"
                    }}
                >

                    <div className="card">
                        <h3>💰 Cotizaciones</h3>
                        <h1>
                            {dashboard.cotizaciones}
                        </h1>
                        <p>
                            Registradas
                        </p>
                    </div>

                    <div className="card">
                        <h3>📋 Trabajos</h3>
                        <h1>
                            {dashboard.trabajos}
                        </h1>
                        <p>
                            En proceso
                        </p>
                    </div>

                    <div className="card">
                        <h3>👥 Clientes</h3>
                        <h1>
                            {dashboard.clientes}
                        </h1>
                        <p>
                            Registrados
                        </p>
                    </div>

                    <div className="card">
                        <h3>👷 Empleados</h3>
                        <h1>
                            {dashboard.empleados}
                        </h1>
                        <p>
                            Activos
                        </p>
                    </div>

                    <div className="card">
                        <h3>📈 Avance</h3>
                        <h1>
                            {dashboard.avance}%
                        </h1>
                        <p>
                            Promedio general
                        </p>
                    </div>

                    <div className="card">
                        <h3>💵 Facturación</h3>
                        <h1>
                            $
                            {Number(
                                dashboard.facturado
                            ).toFixed(2)}
                        </h1>
                        <p>
                            Cotizaciones generadas
                        </p>
                    </div>

                </div>

            )}

            <div
                className="card"
                style={{
                    marginTop: "20px"
                }}
            >

                <h2>
                    Resumen del Sistema
                </h2>

                <p>

                    Sistema web para la gestión de
                    muebles personalizados, control de
                    clientes, cotizaciones, producción,
                    avances y seguimiento de trabajos.

                </p>

            </div>

        </>

    );

}

export default Inicio;