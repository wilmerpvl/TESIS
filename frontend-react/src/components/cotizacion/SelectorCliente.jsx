import { useState, useRef, useEffect } from "react";

function SelectorCliente({
    clientes = [],
    clienteSeleccionado,
    setClienteSeleccionado
}) {
    const [busqueda, setBusqueda] = useState("");
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const containerRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setMostrarDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filtrar clientes por nombre o identificación
    const clientesFiltrados = clientes.filter(c => {
        const query = busqueda.toLowerCase().trim();
        if (!query) return true;
        const nombre = (c.nombre || "").toLowerCase();
        const ident = (c.identificacion || "").toLowerCase();
        return nombre.includes(query) || ident.includes(query);
    });

    const seleccionar = (cliente) => {
        setClienteSeleccionado(cliente);
        setBusqueda("");
        setMostrarDropdown(false);
    };

    const deseleccionar = () => {
        setClienteSeleccionado(null);
        setBusqueda("");
    };

    return (
        <div ref={containerRef} style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b", fontWeight: "700" }}>2. Cliente</h3>
                {clienteSeleccionado && (
                    <button
                        type="button"
                        onClick={deseleccionar}
                        style={{
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#475569",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        🔄 Cambiar Cliente
                    </button>
                )}
            </div>

            {!clienteSeleccionado ? (
                <div style={{ marginTop: "15px", position: "relative" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: "14px", fontSize: "16px", color: "#94a3b8" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Escriba nombre o cédula/RUC del cliente para buscar..."
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setMostrarDropdown(true);
                            }}
                            onFocus={() => setMostrarDropdown(true)}
                            style={{
                                width: "100%",
                                padding: "12px 14px 12px 40px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "15px",
                                outline: "none",
                                transition: "all 0.2s"
                            }}
                        />
                    </div>

                    {mostrarDropdown && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                marginTop: "6px",
                                maxHeight: "250px",
                                overflowY: "auto",
                                backgroundColor: "#ffffff",
                                borderRadius: "10px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15), 0 2px 5px rgba(0,0,0,0.05)",
                                border: "1px solid #cbd5e1",
                                zIndex: 999
                            }}
                        >
                            {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map(cliente => (
                                    <div
                                        key={cliente.id_cliente}
                                        onClick={() => seleccionar(cliente)}
                                        style={{
                                            padding: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            borderBottom: "1px solid #f1f5f9",
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                    >
                                        <div>
                                            <strong style={{ display: "block", color: "#1e293b", fontSize: "14px" }}>
                                                👤 {cliente.nombre}
                                            </strong>
                                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                                                🆔 Cédula/RUC: {cliente.identificacion || "S/I"}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                color: "var(--verde-principal)",
                                                backgroundColor: "#f0fdf4",
                                                padding: "4px 8px",
                                                borderRadius: "6px"
                                            }}
                                        >
                                            Seleccionar ➔
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                                    No se encontraron clientes con "{busqueda}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    style={{
                        marginTop: "15px",
                        padding: "16px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "20px" }}>👤</span>
                        <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                            {clienteSeleccionado.nombre}
                        </h4>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "10px",
                            fontSize: "14px",
                            color: "#475569"
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            <strong>Identificación:</strong> {clienteSeleccionado.identificacion || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Teléfono:</strong> {clienteSeleccionado.telefono || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Correo:</strong> {clienteSeleccionado.correo || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Dirección:</strong> {clienteSeleccionado.direccion || "N/A"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SelectorCliente;