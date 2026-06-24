import api from "./api";

export const obtenerAccesorios = async () => {
  const res = await api.get("/accesorios");
  return res.data;
};

export const crearAccesorio = async (data) => {
  const res = await api.post("/accesorios", data);
  return res.data;
};

export const actualizarAccesorio = async (id, data) => {
  const res = await api.put(`/accesorios/${id}`, data);
  return res.data;
};

export const eliminarAccesorio = async (id, id_usuario) => {
  const res = await api.delete(`/accesorios/${id}`, {
    params: { id_usuario }
  });
  return res.data;
};