import { useState } from "react";
import api from "../../services/api";

function obtenerColor(color) {

    const colores = {

        // LISOS
        blanco: "#ffffff",
        gris: "#9ca3af",
        "gris ideal": "#9ca3af",

        // MADERAS CLARAS
        bellota: "#9b6b43",
        toquilla: "#c9a26b",
        capri: "#b89063",
        "roble natural": "#c19a6b",
        "roble gris": "#8b8f94",
        "roble chic": "#b88a5a",
        "encino marrón": "#8a5a3b",
        "cedro merak": "#9c6b4f",

        // MADERAS OSCURAS
        espresso: "#4a2c1d",
        "canela nuez": "#7b4f31",
        milano: "#6d4c41",
        "roble negro": "#2b2b2b",

        // COLORES ESPECIALES
        titanio: "#7d7d7d",
        "seike titanio": "#7d7d7d",

        verde: "#2e8b57",
        "visón verde": "#5f7f68",
        ágave: "#7da27d",

        // TRIPLEX
        natural: "#d2b48c",
        crudo: "#e8d7b5"
    };

    return colores[
        color?.toLowerCase().trim()
    ] || "#cccccc";

}

function ModalTableros({
    visible,
    tableros = [],
    onCerrar,
    onSeleccionar
}) {

    const [busqueda, setBusqueda] =
        useState("");

    if (!visible) return null;

    const filtrados = tableros.filter(t => {

        const texto = `
            ${t.nombre || ""}
            ${t.color || ""}
            ${t.tipo || ""}
        `.toLowerCase();

        return texto.includes(
            busqueda.toLowerCase()
        );

    });

    return (

        <div className="modal-tableros">

            <div className="modal-contenido">

                <div className="modal-header">

                    <h2>
                        Seleccionar Tablero
                    </h2>

                    <button
                        className="btn-cerrar-modal"
                        onClick={onCerrar}
                    >
                        ✕
                    </button>

                </div>

                <input
                    type="text"
                    placeholder="Buscar tablero..."
                    value={busqueda}
                    onChange={(e) =>
                        setBusqueda(
                            e.target.value
                        )
                    }
                />

                <div className="lista-tableros">

                    {filtrados.length > 0 ? (

                        filtrados.map(tablero => (

                            <div
                                key={tablero.id_tablero}
                                className="item-tablero"
                            >

                                <div
                                    className="color-tablero"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        border: "1px solid #cbd5e1"
                                    }}
                                >
                                    {tablero.imagen ? (
                                        <img
                                            src={`${api.defaults.baseURL.replace("/api", "")}/uploads/${tablero.imagen}`}
                                            alt={tablero.nombre}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                background: obtenerColor(tablero.color)
                                            }}
                                        />
                                    )}
                                </div>

                                <h4>
                                    {tablero.nombre}
                                </h4>

                                <p>
                                    <strong>Tipo:</strong>{" "}
                                    {tablero.tipo}
                                </p>

                                <p>
                                    <strong>Color:</strong>{" "}
                                    {tablero.color}
                                </p>

                                <p>
                                    <strong>Precio:</strong>{" "}
                                    $
                                    {parseFloat(
                                        tablero.precio_tablero
                                    ).toFixed(2)}
                                </p>

                                <button
                                    className="btn-green"
                                    onClick={() => {

                                        onSeleccionar(
                                            tablero
                                        );

                                        onCerrar();

                                    }}
                                >
                                    Seleccionar
                                </button>

                            </div>

                        ))

                    ) : (

                        <div
                            style={{
                                padding: "20px"
                            }}
                        >
                            No se encontraron
                            tableros
                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default ModalTableros;