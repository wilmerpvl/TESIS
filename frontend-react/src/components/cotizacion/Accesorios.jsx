import React from "react";

function Accesorios({
    accesoriosDisponibles = [],
    accesorios = [],
    setAccesorios
}) {

    const agregarAccesorio = () => {

        setAccesorios([
            ...accesorios,
            {
                id: Date.now(),
                id_accesorio: "",
                cantidad: 1
            }
        ]);

    };

    const eliminarAccesorio = (id) => {

        setAccesorios(
            accesorios.filter(
                a => a.id !== id
            )
        );

    };

    const actualizarAccesorio = (
        id,
        campo,
        valor
    ) => {

        setAccesorios(
            accesorios.map(a =>
                a.id === id
                    ? {
                        ...a,
                        [campo]: valor
                    }
                    : a
            )
        );

    };

    return (

        <div className="card">

            <div className="partes-header">

                <h3>
                    Accesorios Generales
                </h3>

                <button
                    className="btn-green"
                    onClick={agregarAccesorio}
                >
                    Agregar Accesorio
                </button>

            </div>

            {accesorios.map(acc => (

                <div
                    key={acc.id}
                    className="parte-item"
                >

                    <div className="form-grid">

                        <select
                            value={acc.id_accesorio}
                            onChange={(e) =>
                                actualizarAccesorio(
                                    acc.id,
                                    "id_accesorio",
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Seleccione accesorio
                            </option>

                            {accesoriosDisponibles.map(a => (

                                <option
                                    key={a.id_accesorio}
                                    value={a.id_accesorio}
                                >
                                    {a.nombre} - $
                                    {a.precio_unitario}
                                </option>

                            ))}

                        </select>

                        <input
                            type="number"
                            min="1"
                            value={acc.cantidad}
                            onChange={(e) =>
                                actualizarAccesorio(
                                    acc.id,
                                    "cantidad",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <button
                        className="btn-delete"
                        onClick={() =>
                            eliminarAccesorio(acc.id)
                        }
                    >
                        Eliminar
                    </button>

                </div>

            ))}

        </div>

    );

}

export default Accesorios;