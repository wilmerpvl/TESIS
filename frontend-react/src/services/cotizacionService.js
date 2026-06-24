const API = "http://localhost:3000/api";
export const obtenerTiposMueble = async () => {
    const res = await fetch(`${API}/tipos-mueble`);
    return await res.json();
};
export const obtenerTableros = async () => {
    const res = await fetch(`${API}/tableros-cotizacion`);
    return await res.json();
};
export const obtenerAccesorios = async () => {
    const res = await fetch(`${API}/accesorios-cotizacion`);
    return await res.json();
};
export const obtenerSecciones = async () => {
    const res = await fetch(`${API}/secciones`);
    return await res.json();
};
export const obtenerModulos = async (idTipo, idSeccion) => {
    const res = await fetch(
        `${API}/modulos/${idTipo}/${idSeccion}`
    );
    return await res.json();
};
export const obtenerPiezas = async (idModulo) => {
    const res = await fetch(
        `${API}/piezas/${idModulo}`
    );
    return await res.json();
};
export const obtenerClientes = async () => {
    const res = await fetch(`${API}/clientes`);
    return await res.json();
};
export const guardarCotizacion = async (data) => {
    const res = await fetch(
        `${API}/guardar-cotizacion`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    return await res.json();
};
// ======================================
// TRABAJOS
// ======================================
export const obtenerTrabajosDisponibles = async () => {
    const res = await fetch(`${API}/trabajos-disponibles`);
    return await res.json();
};
export const crearTrabajo = async (datos) => {
    const res = await fetch(
        `${API}/trabajos`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        }
    );
    return await res.json();
};
export const obtenerTrabajos = async () => {
    const res = await fetch(`${API}/trabajos`);
    return await res.json();
};
export const obtenerTrabajosProgreso = async () => {
    const res = await fetch(`${API}/trabajos-progreso`);
    return await res.json();
};
export const obtenerTrabajosCompletados = async () => {
    const res = await fetch(`${API}/trabajos-completados`);
    return await res.json();
};
export const obtenerDetalleTrabajo = async (id) => {
    const res = await fetch(`${API}/trabajo/${id}`);
    return await res.json();
};
export const obtenerAvances = async (idTrabajo) => {
    const res = await fetch(`${API}/avances/${idTrabajo}`);
    return await res.json();
};
export const registrarAvance = async (data) => {
    const formData = new FormData();
    formData.append("id_trabajo", data.id_trabajo);
    formData.append("porcentaje", data.porcentaje);
    formData.append("descripcion", data.descripcion);
    
    if (data.id_usuario) {
        formData.append("id_usuario", data.id_usuario);
    }
    if (data.fecha) {
        formData.append("fecha", data.fecha);
    }
    if (data.imagen) {
        formData.append("imagen", data.imagen);
    }
    const res = await fetch(
        `${API}/registrar-avance`,
        {
            method: "POST",
            body: formData
        }
    );
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Error al registrar el avance");
    }
    return result;
};
export const finalizarTrabajo = async (id, id_usuario) => {
    const res = await fetch(
        `${API}/finalizar-trabajo/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id_usuario })
        }
    );
    return await res.json();
};
// ======================================
// PERFIL
// ======================================
export const obtenerPerfil = async (id) => {
    const res = await fetch(`${API}/perfil/${id}`);
    return await res.json();
};
export const actualizarPerfil = async (id, data) => {
    const res = await fetch(
        `${API}/perfil/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    return await res.json();
};
export const obtenerDashboard = async () => {
    const res = await fetch(`${API}/dashboard`);
    return await res.json();
};
