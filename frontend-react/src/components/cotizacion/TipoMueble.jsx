function TipoMueble({
    tipos,
    tipoSeleccionado,
    onChange
}) {
    return (
        <div style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "16px", color: "#1e293b", fontWeight: "700", marginBottom: "12px" }}>
                1. Tipo de Mueble
            </h3>
            <div>
                <select
                    value={tipoSeleccionado}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        outline: "none"
                    }}
                >
                    <option value="">
                        Seleccione el tipo de mueble...
                    </option>

                    {tipos.map(tipo => (
                        <option
                            key={tipo.id_tipo}
                            value={tipo.id_tipo}
                        >
                            {tipo.nombre}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default TipoMueble;