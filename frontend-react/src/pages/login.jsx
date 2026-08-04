import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
            const res = await api.post("/login", {
                email,
                password
            });

            const data = res.data;

            const userData = {
                ...data.usuario,
                token: data.token
            };

            loginUser(userData);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.mensaje || "Error al conectar con el servidor"
            );
        }
    };

    return (
        <div className="overlay">
            <div className="login-box">
                {/* Ícono de inicio de sesión en lugar de la imagen de cocina */}
                <div className="top-icon-box">
                    <i className="fa fa-user-circle"></i>
                </div>

                <div className="login-content">
                    <h2>Iniciar Sesión</h2>
                    <p className="subtitle">
                        Sistema de Gestión de Muebles
                    </p>

                    <div className="input-group">
                        <i className="fa fa-user"></i>
                        <input
                            type="email"
                            placeholder="Correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && login()}
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa fa-lock"></i>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && login()}
                        />
                    </div>

                    <button className="login-btn" onClick={login}>
                        Ingresar
                    </button>

                    {error && (
                        <p id="error">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;