import { useEffect, useState } from "react";
import "../css/clientes.css";

export default function Clientes() {

    const [clientes, setClientes] = useState([]);
    const [buscar, setBuscar] = useState("");

    const [form, setForm] = useState({
        nombre: "",
        identificacion: "",
        telefono: "",
        correo: "",
        direccion: ""
    });

    const [editando, setEditando] = useState(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    async function cargarClientes() {

        const res = await fetch(
            "http://localhost:3000/api/clientes"
        );

        const data = await res.json();

        setClientes(data);

    }

    function handleChange(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }

    async function guardarCliente() {

        if (!form.nombre) {
            alert("Ingrese el nombre");
            return;
        }

        const url = editando
            ? `http://localhost:3000/api/clientes/${editando}`
            : "http://localhost:3000/api/clientes";

        const method = editando
            ? "PUT"
            : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        setForm({
            nombre: "",
            identificacion: "",
            telefono: "",
            correo: "",
            direccion: ""
        });

        setEditando(null);

        cargarClientes();

    }

    async function eliminarCliente(id) {

        if (!window.confirm("¿Eliminar cliente?"))
            return;

        await fetch(
            `http://localhost:3000/api/clientes/${id}`,
            {
                method: "DELETE"
            }
        );

        cargarClientes();

    }

    function editarCliente(cliente) {

        setForm({
            nombre: cliente.nombre,
            identificacion: cliente.identificacion,
            telefono: cliente.telefono,
            correo: cliente.correo,
            direccion: cliente.direccion
        });

        setEditando(cliente.id_cliente);

    }

    const clientesFiltrados = clientes.filter(c =>
        Object.values(c)
            .join(" ")
            .toLowerCase()
            .includes(buscar.toLowerCase())
    );

    return (

        <>

            <div className="page-header">

                <div className="page-title">

                    <div className="icon-box">
                        👥
                    </div>

                    <div>
                        <h1>Clientes</h1>
                        <p>
                            Gestiona los clientes
                        </p>
                    </div>

                </div>

            </div>

            <div className="crud-top">

                <div className="card form-card">

                    <h3>
                        {editando
                            ? "Editar Cliente"
                            : "Nuevo Cliente"}
                    </h3>

                    <div className="form-grid">

                        <input
                            name="nombre"
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={handleChange}
                        />

                        <input
                            name="identificacion"
                            placeholder="Cédula / RUC"
                            value={form.identificacion}
                            onChange={handleChange}
                        />

                        <input
                            name="telefono"
                            placeholder="Teléfono"
                            value={form.telefono}
                            onChange={handleChange}
                        />

                        <input
                            name="correo"
                            placeholder="Correo"
                            value={form.correo}
                            onChange={handleChange}
                        />

                        <input
                            name="direccion"
                            placeholder="Dirección"
                            value={form.direccion}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="crud-actions">

                        <button
                            className="btn-green"
                            onClick={guardarCliente}
                        >
                            {editando
                                ? "Actualizar Cliente"
                                : "Registrar Cliente"}
                        </button>

                        <button
                            className="btn-light"
                            onClick={() => {

                                setEditando(null);

                                setForm({
                                    nombre: "",
                                    identificacion: "",
                                    telefono: "",
                                    correo: "",
                                    direccion: ""
                                });

                            }}
                        >
                            Limpiar
                        </button>

                    </div>

                </div>

                <div className="card search-card">

                    <h3>Buscar Cliente</h3>

                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={buscar}
                            onChange={(e) =>
                                setBuscar(e.target.value)
                            }
                        />

                    </div>

                </div>

            </div>

            <div className="table-card">

                <div className="table-header">
                    <h3>Lista de Clientes</h3>
                </div>

                <table>

                    <thead>

                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Identificación</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>

                    </thead>

                    <tbody>

                        {clientesFiltrados.map(
                            (c, i) => (

                                <tr key={c.id_cliente}>

                                    <td>{i + 1}</td>

                                    <td>

                                        <div className="user-info">

                                            <div className="avatar">
                                                {c.nombre.charAt(0)}
                                            </div>

                                            {c.nombre}

                                        </div>

                                    </td>

                                    <td>
                                        {c.identificacion}
                                    </td>

                                    <td>
                                        {c.telefono}
                                    </td>

                                    <td>
                                        {c.correo}
                                    </td>

                                    <td>
                                        {c.direccion}
                                    </td>

                                    <td className="actions">

                                        <button
                                            className="btn-edit"
                                            onClick={() =>
                                                editarCliente(c)
                                            }
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="btn-delete"
                                            onClick={() =>
                                                eliminarCliente(
                                                    c.id_cliente
                                                )
                                            }
                                        >
                                            🗑️
                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </>

    );

}