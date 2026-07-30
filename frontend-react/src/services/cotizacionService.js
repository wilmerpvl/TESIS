import api from "./api";

export const obtenerTiposMueble = async () => {
    const res = await api.get("/tipos-mueble");
    return res.data;
};

export const obtenerTableros = async () => {
    const res = await api.get("/tableros-cotizacion");
    return res.data;
};

export const obtenerAccesorios = async () => {
    const res = await api.get("/accesorios-cotizacion");
    return res.data;
};

export const obtenerSecciones = async () => {
    const res = await api.get("/secciones");
    return res.data;
};

export const obtenerModulos = async (idTipo, idSeccion) => {
    const res = await api.get(`/modulos/${idTipo}/${idSeccion}`);
    return res.data;
};

export const obtenerPiezas = async (idModulo) => {
    const res = await api.get(`/piezas/${idModulo}`);
    return res.data;
};

export const obtenerClientes = async () => {
    const res = await api.get("/clientes-cotizacion");
    return res.data;
};

export const guardarCotizacion = async (data) => {
    const res = await api.post("/guardar-cotizacion", data);
    return res.data;
};

// ======================================
// TRABAJOS
// ======================================
export const obtenerTrabajosDisponibles = async () => {
    const res = await api.get("/trabajos-disponibles");
    return res.data;
};

export const crearTrabajo = async (datos) => {
    const res = await api.post("/trabajos", datos);
    return res.data;
};

export const obtenerTrabajos = async () => {
    const res = await api.get("/trabajos");
    return res.data;
};

export const obtenerTrabajosProgreso = async () => {
    const res = await api.get("/trabajos-progreso");
    return res.data;
};

export const obtenerTrabajosCompletados = async () => {
    const res = await api.get("/trabajos-completados");
    return res.data;
};

export const obtenerDetalleTrabajo = async (id) => {
    const res = await api.get(`/trabajo/${id}`);
    return res.data;
};

export const obtenerAvances = async (idTrabajo) => {
    const res = await api.get(`/avances/${idTrabajo}`);
    return res.data;
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
    
    const res = await api.post("/registrar-avance", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const finalizarTrabajo = async (id, id_usuario) => {
    const res = await api.put(`/finalizar-trabajo/${id}`, { id_usuario });
    return res.data;
};

// ======================================
// PERFIL
// ======================================
export const obtenerPerfil = async (id) => {
    const res = await api.get(`/perfil/${id}`);
    return res.data;
};

export const actualizarPerfil = async (id, data) => {
    const res = await api.put(`/perfil/${id}`, data);
    return res.data;
};

export const obtenerDashboard = async () => {
    const res = await api.get("/dashboard");
    return res.data;
};
