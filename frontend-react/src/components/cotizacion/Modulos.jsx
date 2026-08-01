import { useEffect, useState } from "react";

import {
    obtenerSecciones,
    obtenerModulos,
    obtenerPiezas
} from "../../services/cotizacionService";

function Modulos({
    tipoSeleccionado,
    modulos = [],
    setModulos
}) {

    const [secciones, setSecciones] =
        useState([]);

    const [modulosDisponibles,
        setModulosDisponibles] =
        useState({});



    const handleKeyPressDecimals = (e) => {
        if (!/[0-9.]/.test(e.key)) {
            e.preventDefault();
        }
        if (e.key === "." && e.target.value.includes(".")) {
            e.preventDefault();
        }
    };

    const handleKeyPressOnlyNumbers = (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    useEffect(() => {

        if (!tipoSeleccionado) return;

        cargarSecciones();

    }, [tipoSeleccionado]);



    const cargarSecciones = async () => {

        try {

            const data =
                await obtenerSecciones();

            setSecciones(data);

            const temp = {};

            for (const s of data) {

                temp[s.id_seccion] =
                    await obtenerModulos(
                        tipoSeleccionado,
                        s.id_seccion
                    );

            }

            setModulosDisponibles(temp);

        } catch (error) {

            console.error(error);

        }

    };



    const agregarModulo = async (
        idModulo,
        nombreModulo,
        id_seccion
    ) => {

        if (!idModulo) return;

        try {

            const piezas =
                await obtenerPiezas(
                    idModulo
                );

            console.log(
                "PIEZAS API",
                piezas
            );

            const piezasPreparadas =
                piezas.map(p => ({
                    ...p,
                    ancho: "",
                    alto: "",
                    cantidad: 1
                }));

            setModulos([
                ...modulos,
                {
                    id: Date.now(),
                    id_modulo: idModulo,
                    nombre: nombreModulo,
                    id_seccion: id_seccion,
                    piezas: piezasPreparadas
                }
            ]);

        } catch (error) {

            console.error(error);

        }

    };



    const eliminarModulo = (id) => {

        setModulos(
            modulos.filter(
                m => m.id !== id
            )
        );

    };



    const actualizarPieza = (
        idModulo,
        indexPieza,
        campo,
        valor
    ) => {

        const nuevosModulos =
            modulos.map(modulo => {

                if (
                    modulo.id !== idModulo
                ) {
                    return modulo;
                }

                return {

                    ...modulo,

                    piezas:
                        modulo.piezas.map(
                            (
                                pieza,
                                index
                            ) => {

                                if (
                                    index !==
                                    indexPieza
                                ) {
                                    return pieza;
                                }

                                return {
                                    ...pieza,
                                    [campo]: valor
                                };

                            }
                        )

                };

            });

        setModulos(
            nuevosModulos
        );

    };



    return (
        <>
            {secciones.map(
                seccion => (
                    <div
                        key={seccion.id_seccion}
                        style={{ marginBottom: "25px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}
                    >
                        <h3 style={{ fontSize: "16px", color: "#1e293b", fontWeight: "700", marginBottom: "12px" }}>
                            {seccion.nombre}
                        </h3>

                        <SelectorModulo
                            seccion={seccion}
                            modulos={
                                modulosDisponibles[
                                seccion.id_seccion
                                ] || []
                            }
                            agregarModulo={
                                agregarModulo
                            }
                        />

                        {/* Módulos agregados en esta sección */}
                        {modulos.filter(m => m.id_seccion === seccion.id_seccion).map(
                            modulo => (
                                <div
                                    key={modulo.id}
                                    className="card modulo-item"
                                    style={{ marginTop: "15px", border: "1px solid #e2e8f0" }}
                                >
                                    <div className="partes-header">
                                        <h3>{modulo.nombre}</h3>
                                        <button
                                            className="btn-delete"
                                            onClick={() => eliminarModulo(modulo.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="table-card">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Pieza</th>
                                                    <th>Ancho</th>
                                                    <th>Alto</th>
                                                    <th>Cantidad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modulo.piezas?.map((pieza, index) => (
                                                    <tr key={index}>
                                                        <td>{pieza.nombre}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={pieza.ancho}
                                                                onChange={(e) =>
                                                                    actualizarPieza(
                                                                        modulo.id,
                                                                        index,
                                                                        "ancho",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                onKeyPress={handleKeyPressDecimals}
                                                                style={{
                                                                    width: "100%",
                                                                    minWidth: "80px",
                                                                    maxWidth: "120px",
                                                                    padding: "8px 12px",
                                                                    border: "1px solid #cbd5e1",
                                                                    borderRadius: "8px",
                                                                    outline: "none",
                                                                    fontSize: "14px",
                                                                    textAlign: "center"
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={pieza.alto}
                                                                onChange={(e) =>
                                                                    actualizarPieza(
                                                                        modulo.id,
                                                                        index,
                                                                        "alto",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                onKeyPress={handleKeyPressDecimals}
                                                                style={{
                                                                    width: "100%",
                                                                    minWidth: "80px",
                                                                    maxWidth: "120px",
                                                                    padding: "8px 12px",
                                                                    border: "1px solid #cbd5e1",
                                                                    borderRadius: "8px",
                                                                    outline: "none",
                                                                    fontSize: "14px",
                                                                    textAlign: "center"
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={pieza.cantidad}
                                                                onChange={(e) =>
                                                                    actualizarPieza(
                                                                        modulo.id,
                                                                        index,
                                                                        "cantidad",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                onKeyPress={handleKeyPressOnlyNumbers}
                                                                style={{
                                                                    width: "100%",
                                                                    minWidth: "80px",
                                                                    maxWidth: "120px",
                                                                    padding: "8px 12px",
                                                                    border: "1px solid #cbd5e1",
                                                                    borderRadius: "8px",
                                                                    outline: "none",
                                                                    fontSize: "14px",
                                                                    textAlign: "center"
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )
            )}
        </>
    );

}



function SelectorModulo({
    seccion,
    modulos,
    agregarModulo
}) {

    const [seleccion,
        setSeleccion] =
        useState("");

    return (

        <div className="form-grid">

            <select
                value={seleccion}
                onChange={(e) =>
                    setSeleccion(
                        e.target.value
                    )
                }
            >

                <option value="">
                    Seleccione módulo
                </option>

                {modulos.map(
                    m => (

                        <option
                            key={
                                m.id_modulo
                            }
                            value={
                                m.id_modulo
                            }
                        >
                            {m.nombre}
                        </option>

                    )
                )}

            </select>

            <button
                className="btn-green"
                onClick={() => {

                    const modulo =
                        modulos.find(
                            m =>
                                m.id_modulo ==
                                seleccion
                        );

                    if (!modulo) return;

                    agregarModulo(
                        modulo.id_modulo,
                        modulo.nombre,
                        seccion.id_seccion
                    );

                    setSeleccion("");

                }}
            >

                Agregar módulo

            </button>

        </div>

    );

}

export default Modulos;