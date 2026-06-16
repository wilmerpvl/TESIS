import { useEffect, useState } from "react";

function Inicio() {

    const [usuario, setUsuario] =
        useState(null);

    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("usuario")
        );

        setUsuario(user);

    }, []);

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
                    Bienvenido
                </h2>

                <p
                    style={{
                        marginTop: "10px"
                    }}
                >

                    {usuario
                        ? usuario.nombre
                        : "Usuario"}

                </p>

            </div>

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
                    <h3>👥 Usuarios</h3>
                    <p>
                        Gestión de usuarios
                    </p>
                </div>

                <div className="card">
                    <h3>🧑‍💼 Clientes</h3>
                    <p>
                        Administración de clientes
                    </p>
                </div>

                <div className="card">
                    <h3>🪵 Tableros</h3>
                    <p>
                        Control de materiales
                    </p>
                </div>

                <div className="card">
                    <h3>🔩 Accesorios</h3>
                    <p>
                        Gestión de accesorios
                    </p>
                </div>

                <div className="card">
                    <h3>💰 Cotizaciones</h3>
                    <p>
                        Generación de cotizaciones
                    </p>
                </div>

                <div className="card">
                    <h3>📋 Trabajos</h3>
                    <p>
                        Seguimiento de pedidos
                    </p>
                </div>

            </div>

        </>

    );

}

export default Inicio;