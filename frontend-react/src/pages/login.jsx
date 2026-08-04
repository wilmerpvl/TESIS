import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "../css/style.css";
import "../css/usuarios.css";
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
            className="overlay"
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
                className="login-box"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                    padding: "45px 35px",
                    boxSizing: "border-box",
                    textAlign: "center"
                }}
            >
                {/* Ícono Circular de Inicio de Sesión / Candado */}
                <div 
                    style={{
                        width: "76px",
                        height: "76px",
                        borderRadius: "50%",
                        backgroundColor: "#eaf5ec",
                        border: "2px solid #3b7f4a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 22px auto",
                        boxShadow: "0 6px 16px rgba(59, 127, 74, 0.15)"
                    }}
                >
                    <i className="fa fa-lock" style={{ fontSize: "36px", color: "#3b7f4a" }}></i>
                </div>

                <h2 style={{ fontSize: "26px", color: "#1e293b", fontWeight: "700", marginBottom: "10px", margin: "0 0 10px 0" }}>
                    Iniciar Sesión
                </h2>

                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "32px", marginTop: 0, fontWeight: "500" }}>
                    Sistema de Gestión de Muebles
                </p>

                {/* Campo Correo */}
                <div 
                    className="input-group"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "25px",
                        marginBottom: "18px",
                        padding: "14px 20px",
                        boxSizing: "border-box"
                    }}
                >
                    <i className="fa fa-user" style={{ color: "#64748b", fontSize: "16px", marginRight: "14px", width: "18px", textAlign: "center" }}></i>
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
                    className="input-group"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "25px",
                        marginBottom: "28px",
                        padding: "14px 20px",
                        boxSizing: "border-box"
                    }}
                >
                    <i className="fa fa-lock" style={{ color: "#64748b", fontSize: "16px", marginRight: "14px", width: "18px", textAlign: "center" }}></i>
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

                {/* Botón Ingresar Verde (#3b7f4a) */}
                <button 
                    type="button"
                    className="btn-green login-btn" 
                    onClick={login}
                    style={{
                        width: "100%",
                        padding: "15px 24px",
                        backgroundColor: "#3b7f4a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "25px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(59, 127, 74, 0.4)",
                        marginTop: "5px",
                        marginBottom: "10px",
                        display: "block",
                        textAlign: "center"
                    }}
                >
                    Ingresar
                </button>

                {error && (
                    <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", marginTop: "16px" }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;