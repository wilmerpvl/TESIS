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
                <div className="login-content">
                    {/* Ícono vectorial de usuario en círculo (avatar) */}
                    <div 
                        style={{
                            width: "76px",
                            height: "76px",
                            borderRadius: "50%",
                            backgroundColor: "#eaf5ec",
                            border: "2.5px solid #3b7f4a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px auto",
                            boxShadow: "0 6px 16px rgba(59, 127, 74, 0.15)"
                        }}
                    >
                        <svg 
                            viewBox="0 0 24 24" 
                            width="46" 
                            height="46" 
                            fill="none" 
                            stroke="#3b7f4a" 
                            strokeWidth="1.8" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M18 20a6 6 0 0 0-12 0" />
                            <circle cx="12" cy="10" r="4" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </div>

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