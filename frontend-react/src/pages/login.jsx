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
        <div 
            style={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #774822, #2649bb)",
                padding: "20px",
                boxSizing: "border-box"
            }}
        >
            <div 
                style={{
                    width: "100%",
                    maxWidth: "390px",
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
                    padding: "35px 28px",
                    boxSizing: "border-box",
                    textAlign: "center"
                }}
            >
                {/* Ícono redondeado estilizado de usuario (avatar en círculo) */}
                <div 
                    style={{
                        width: "82px",
                        height: "82px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        border: "3px solid #1F3D2B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 18px auto",
                        boxShadow: "0 6px 16px rgba(31, 61, 43, 0.15)"
                    }}
                >
                    <svg 
                        viewBox="0 0 24 24" 
                        width="52" 
                        height="52" 
                        fill="none" 
                        stroke="#1F3D2B" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M18 20a6 6 0 0 0-12 0" />
                        <circle cx="12" cy="10" r="4" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                </div>

                <h2 style={{ fontSize: "23px", color: "#0f172a", fontWeight: "700", marginBottom: "6px", margin: "0 0 6px 0" }}>
                    Iniciar Sesión
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "25px", marginTop: 0 }}>
                    Sistema de Gestión de Muebles
                </p>

                {/* Campo Correo */}
                <div 
                    style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "25px",
                        marginBottom: "16px",
                        padding: "12px 18px"
                    }}
                >
                    <i className="fa fa-user" style={{ color: "#64748b", fontSize: "16px", marginRight: "12px", width: "18px", textAlign: "center" }}></i>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                        style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            width: "100%",
                            fontSize: "15px",
                            color: "#1e293b"
                        }}
                    />
                </div>

                {/* Campo Contraseña */}
                <div 
                    style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "25px",
                        marginBottom: "22px",
                        padding: "12px 18px"
                    }}
                >
                    <i className="fa fa-lock" style={{ color: "#64748b", fontSize: "16px", marginRight: "12px", width: "18px", textAlign: "center" }}></i>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                        style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            width: "100%",
                            fontSize: "15px",
                            color: "#1e293b"
                        }}
                    />
                </div>

                {/* Botón Ingresar */}
                <button 
                    type="button"
                    onClick={login}
                    style={{
                        width: "100%",
                        padding: "14px 20px",
                        backgroundColor: "#1F3D2B",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(31, 61, 43, 0.35)",
                        marginTop: "5px",
                        marginBottom: "10px",
                        display: "block",
                        textAlign: "center"
                    }}
                >
                    Ingresar
                </button>

                {error && (
                    <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "12px" }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;