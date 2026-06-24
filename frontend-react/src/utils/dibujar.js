export const dibujar = (
    canvasRef,
    piezasOriginales = [],
    colorTablero = "Blanco"
) => {

    const canvas = canvasRef?.current;

    if (!canvas) {
        return {
            totalTablones: 0,
            tablones: []
        };
    }

    const obtenerColor = (color) => {

        const colores = {

            blanco: "#ffffff",
            "roble negro": "#222222",

            bellota: "#9b6b43",
            toquilla: "#c9a26b",
            capri: "#b89063",

            "roble natural": "#c19a6b",
            "roble gris": "#76797c",
            "gris ideal": "#8b8f94",
            "roble chic": "#b88a5a",

            "encino marrón": "#8a5a3b",
            "cedro merak": "#9c6b4f",

            espresso: "#4a2c1d",
            "canela nuez": "#7b4f31",

            milano: "#6d4c41",

            titanio: "#7d7d7d",
            "seike titanio": "#7d7d7d",

            verde: "#2e8b57",
            "visón verde": "#5f7f68",
            ágave: "#7da27d",

            natural: "#d2b48c",
            crudo: "#e8d7b5"
        };

        return colores[
            color?.toLowerCase()?.trim()
        ] || "#2563eb";
    };

    const colorPieza =
        obtenerColor(colorTablero);

    const ctx =
        canvas.getContext("2d");

    let piezas = [];

    piezasOriginales.forEach(item => {

        const ancho =
            parseFloat(item.ancho) || 0;

        const alto =
            parseFloat(item.alto) || 0;

        const cantidad =
            parseInt(item.cantidad) || 1;

        const nombre =
            item.nombre || "Pieza";

        if (
            ancho <= 0 ||
            alto <= 0
        ) return;

        for (
            let i = 0;
            i < cantidad;
            i++
        ) {

            piezas.push({
                ancho,
                alto,
                nombre,
                moduloNombre: item.moduloNombre
            });

        }

    });

    if (piezas.length === 0) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return {
            totalTablones: 0,
            tablones: []
        };

    }

    piezas.sort(
        (a, b) =>
            (b.ancho * b.alto) -
            (a.ancho * a.alto)
    );

    const TABLON_W = 244;
    const TABLON_H = 214;

    const escala = 3;

    const anchoPx =
        TABLON_W * escala;

    const altoPx =
        TABLON_H * escala;

    const crearTablon = () => ({

        piezas: [],

        espacios: [
            {
                x: 0,
                y: 0,
                w: TABLON_W,
                h: TABLON_H
            }
        ]

    });

    const dividirEspacio = (
        tablon,
        espacio,
        x,
        y,
        w,
        h
    ) => {

        const nuevosEspacios = [

            {
                x: x + w,
                y: y,
                w: espacio.w - w,
                h: h
            },

            {
                x: x,
                y: y + h,
                w: espacio.w,
                h: espacio.h - h
            }

        ];

        nuevosEspacios.forEach(e => {

            if (
                e.w > 0 &&
                e.h > 0
            ) {

                tablon.espacios.push(e);

            }

        });

    };

    const limpiarEspacios = (
        tablon
    ) => {

        tablon.espacios =
            tablon.espacios.filter(
                (a, i) => {

                    return !tablon.espacios.some(
                        (b, j) => {

                            if (i === j)
                                return false;

                            return (
                                a.x >= b.x &&
                                a.y >= b.y &&
                                a.x + a.w <= b.x + b.w &&
                                a.y + a.h <= b.y + b.h
                            );

                        }
                    );

                }
            );

    };

    let tablones = [
        crearTablon()
    ];

    piezas.forEach(pieza => {

        let colocada = false;

        for (
            const tablon of tablones
        ) {

            tablon.espacios.sort(
                (a, b) => {

                    if (
                        a.y !== b.y
                    ) {

                        return (
                            a.y - b.y
                        );

                    }

                    return (
                        a.x - b.x
                    );

                }
            );

            for (
                let i = 0;
                i < tablon.espacios.length;
                i++
            ) {

                const espacio =
                    tablon.espacios[i];

                let w =
                    pieza.ancho;

                let h =
                    pieza.alto;

                const entraNormal =
                    w <= espacio.w &&
                    h <= espacio.h;

                const entraRotada =
                    h <= espacio.w &&
                    w <= espacio.h;

                if (
                    !entraNormal &&
                    entraRotada
                ) {

                    w = pieza.alto;
                    h = pieza.ancho;

                }

                if (
                    entraNormal ||
                    entraRotada
                ) {

                    tablon.piezas.push({

                        x: espacio.x,
                        y: espacio.y,

                        w,
                        h,

                        nombre:
                            pieza.nombre,

                        texto:
                            `${w} x ${h} cm`,

                        moduloNombre:
                            pieza.moduloNombre

                    });

                    tablon.espacios.splice(
                        i,
                        1
                    );

                    dividirEspacio(
                        tablon,
                        espacio,
                        espacio.x,
                        espacio.y,
                        w,
                        h
                    );

                    limpiarEspacios(
                        tablon
                    );

                    colocada = true;

                    break;

                }

            }

            if (colocada)
                break;

        }

        if (!colocada) {

            const nuevo =
                crearTablon();

            tablones.push(
                nuevo
            );

        }

    });

    canvas.width = 1000;

    canvas.height = Math.max(
        700,
        tablones.length *
        (altoPx + 120)
    );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    tablones.forEach(
        (
            tablon,
            index
        ) => {

            const offsetX = 60;

            const offsetY =
                70 +
                index *
                (altoPx + 120);

            ctx.strokeStyle =
                "#111827";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                offsetX,
                offsetY,
                anchoPx,
                altoPx
            );

            ctx.fillStyle =
                "#111827";

            ctx.font =
                "bold 22px Arial";

            ctx.fillText(
                `TABLÓN ${index + 1} - ${colorTablero}`,
                offsetX,
                offsetY - 20
            );

            tablon.piezas.forEach(
                p => {

                    const x =
                        offsetX +
                        (p.x * escala);

                    const y =
                        offsetY +
                        (p.y * escala);

                    const w =
                        p.w * escala;

                    const h =
                        p.h * escala;

                    ctx.fillStyle =
                        colorPieza;

                    ctx.fillRect(
                        x,
                        y,
                        w,
                        h
                    );

                    ctx.strokeStyle =
                        "#1e293b";

                    ctx.lineWidth = 2;

                    ctx.strokeRect(
                        x,
                        y,
                        w,
                        h
                    );

                    ctx.fillStyle =
                        colorPieza === "#ffffff"
                            ? "#000000"
                            : "#ffffff";

                    let fontSize =
                        Math.min(
                            w / 8,
                            h / 4,
                            15
                        );

                    if (
                        fontSize < 8
                    ) {

                        fontSize = 8;

                    }

                    ctx.font =
                        `bold ${fontSize}px Arial`;

                    const tw1 =
                        ctx.measureText(
                            p.nombre
                        ).width;

                    const tw2 =
                        ctx.measureText(
                            p.texto
                        ).width;

                    ctx.fillText(
                        p.nombre,
                        x +
                        (w / 2) -
                        (tw1 / 2),
                        y +
                        (h / 2) -
                        6
                    );

                    ctx.fillText(
                        p.texto,
                        x +
                        (w / 2) -
                        (tw2 / 2),
                        y +
                        (h / 2) +
                        12
                    );

                }
            );

        }
    );

    return {
        totalTablones:
            tablones.length,
        tablones
    };

};