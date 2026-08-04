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
                    {/* Icono vectorial de inicio de sesión de usuario en círculo */}
                    <div className="login-user-avatar">
                        <svg 
                            viewBox="0 0 24 24" 
                            width="48" 
                            height="48" 
                            fill="none" 
                            stroke="currentColor" 
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
                    <p className="login-subtitle">
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

                    <button 
                        type="button"
                        className="login-btn" 
                        onClick={login}
                        style={{
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "#1F3D2B",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "25px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(31, 61, 43, 0.3)",
                            marginTop: "15px",
                            marginBottom: "10px"
                        }}
                    >
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