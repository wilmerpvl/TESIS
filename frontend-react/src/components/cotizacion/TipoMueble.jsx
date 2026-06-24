function TipoMueble({
    tipos,
    tipoSeleccionado,
    onChange
}) {
    return (
        <div className="card">
            <h3>Tipo de Mueble</h3>
            <div style={{ marginTop: "15px" }}>
                <select
                    value={tipoSeleccionado}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                >
                    <option value="">
                        Seleccione el tipo de mueble
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