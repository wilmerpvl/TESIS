import api from "./api";
export const obtenerTableros = async () => {
  const res = await api.get("/tableros");
  return res.data;
};
export const crearTablero = async (data) => {
  // 'data' ya incluye el id_usuario
  const res = await api.post("/tableros", data);
  return res.data;
};
export const actualizarTablero = async (id, data) => {
  // 'data' ya incluye el id_usuario
  const res = await api.put(`/tableros/${id}`, data);
  return res.data;
};
export const eliminarTablero = async (id, id_usuario) => {
  // Pasamos el id_usuario en los query parameters para la petición DELETE
  const res = await api.delete(`/tableros/${id}`, {
    params: { id_usuario }
  });
  return res.data;
};
