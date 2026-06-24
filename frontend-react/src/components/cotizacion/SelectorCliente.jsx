function SelectorCliente({
    clientes = [],
    clienteSeleccionado,
    setClienteSeleccionado
}) {

    const seleccionarCliente = (id) => {

        const cliente = clientes.find(
            c => c.id_cliente === parseInt(id)
        );

        setClienteSeleccionado(
            cliente || null
        );
    };

    return (

        <div className="card">

            <h3>Cliente</h3>

            <div style={{ marginTop: "15px" }}>
                <select
                    value={
                        clienteSeleccionado?.id_cliente || ""
                    }
                    onChange={(e) =>
                        seleccionarCliente(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Seleccione un cliente...
                    </option>

                    {clientes.map(cliente => (
                        <option
                            key={cliente.id_cliente}
                            value={cliente.id_cliente}
                        >
                            {cliente.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {clienteSeleccionado && (

                <div
                    style={{
                        marginTop: "15px"
                    }}
                >

                    <p>
                        <strong>Identificación:</strong>{" "}
                        {clienteSeleccionado.identificacion}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>{" "}
                        {clienteSeleccionado.telefono}
                    </p>

                    <p>
                        <strong>Correo:</strong>{" "}
                        {clienteSeleccionado.correo}
                    </p>

                    <p>
                        <strong>Dirección:</strong>{" "}
                        {clienteSeleccionado.direccion}
                    </p>

                </div>

            )}

        </div>

    );
}

export default SelectorCliente;