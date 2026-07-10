const API = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

const obtenerHeaders = (isJson = true) => {
    const headers = {};
    if (isJson) {
        headers["Content-Type"] = "application/json";
    }
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        try {
            const usuario = JSON.parse(usuarioStr);
            if (usuario && usuario.token) {
                headers["Authorization"] = `Bearer ${usuario.token}`;
            }
        } catch (error) {
            console.error("Error parsing user token in cotizacionService", error);
        }
    }
    return headers;
};

export const obtenerTiposMueble = async () => {
    const res = await fetch(`${API}/tipos-mueble`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerTableros = async () => {
    const res = await fetch(`${API}/tableros-cotizacion`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerAccesorios = async () => {
    const res = await fetch(`${API}/accesorios-cotizacion`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerSecciones = async () => {
    const res = await fetch(`${API}/secciones`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerModulos = async (idTipo, idSeccion) => {
    const res = await fetch(`${API}/modulos/${idTipo}/${idSeccion}`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerPiezas = async (idModulo) => {
    const res = await fetch(`${API}/piezas/${idModulo}`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerClientes = async () => {
    // Apuntamos a /clientes-cotizacion que es de acceso general
    const res = await fetch(`${API}/clientes-cotizacion`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const guardarCotizacion = async (data) => {
    const res = await fetch(`${API}/guardar-cotizacion`, {
        method: "POST",
        headers: obtenerHeaders(true),
        body: JSON.stringify(data)
    });
    return await res.json();
};

// ======================================
// TRABAJOS
// ======================================
export const obtenerTrabajosDisponibles = async () => {
    const res = await fetch(`${API}/trabajos-disponibles`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const crearTrabajo = async (datos) => {
    const res = await fetch(`${API}/trabajos`, {
        method: "POST",
        headers: obtenerHeaders(true),
        body: JSON.stringify(datos)
    });
    return await res.json();
};

export const obtenerTrabajos = async () => {
    const res = await fetch(`${API}/trabajos`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerTrabajosProgreso = async () => {
    const res = await fetch(`${API}/trabajos-progreso`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerTrabajosCompletados = async () => {
    const res = await fetch(`${API}/trabajos-completados`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerDetalleTrabajo = async (id) => {
    const res = await fetch(`${API}/trabajo/${id}`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const obtenerAvances = async (idTrabajo) => {
    const res = await fetch(`${API}/avances/${idTrabajo}`, {
        headers: obtenerHeaders(false)
    });
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
    const res = await fetch(`${API}/registrar-avance`, {
        method: "POST",
        headers: obtenerHeaders(false), // No incluimos Content-Type: application/json
        body: formData
    });
    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Error al registrar el avance");
    }
    return result;
};

export const finalizarTrabajo = async (id, id_usuario) => {
    const res = await fetch(`${API}/finalizar-trabajo/${id}`, {
        method: "PUT",
        headers: obtenerHeaders(true),
        body: JSON.stringify({ id_usuario })
    });
    return await res.json();
};

// ======================================
// PERFIL
// ======================================
export const obtenerPerfil = async (id) => {
    const res = await fetch(`${API}/perfil/${id}`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};

export const actualizarPerfil = async (id, data) => {
    const res = await fetch(`${API}/perfil/${id}`, {
        method: "PUT",
        headers: obtenerHeaders(true),
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const obtenerDashboard = async () => {
    const res = await fetch(`${API}/dashboard`, {
        headers: obtenerHeaders(false)
    });
    return await res.json();
};
