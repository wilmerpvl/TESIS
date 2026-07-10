import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../css/style.css";
import "../css/login.css";

function Login() {

    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const login = async () => {

        try {

            const loginUrl = window.location.hostname === "localhost" ? "http://localhost:3000/api/login" : "/api/login";
            const res = await fetch(
                loginUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (res.ok) {

                const userData = {
                    ...data.usuario,
                    token: data.token
                };

                loginUser(userData);

                navigate("/");

            } else {

                setError(data.mensaje);

            }

        } catch (err) {

            setError(
                "Error al conectar con el servidor"
            );

        }

    };

    return (

        <div className="overlay">

            <div className="login-box">

                <div className="top-image"></div>

                <div className="login-content">

                    <h2>Iniciar Sesión</h2>

                    <p>
                        Sistema de Gestión de Muebles
                    </p>

                    <div className="input-group">

                        <i className="fa fa-user"></i>

                        <input
                            type="email"
                            placeholder="Correo"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="input-group">

                        <i className="fa fa-lock"></i>

                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <button onClick={login}>
                        Ingresar
                    </button>

                    <p id="error">
                        {error}
                    </p>

                </div>

            </div>

        </div>

    );

}

export default Login;