import api from "./api";

const objectToFormData = (obj) => {
  const formData = new FormData();
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      formData.append(key, obj[key]);
    }
  }
  return formData;
};

export const obtenerTableros = async () => {
  const res = await api.get("/tableros");
  return res.data;
};

export const crearTablero = async (data) => {
  const formData = objectToFormData(data);
  const res = await api.post("/tableros", formData);
  return res.data;
};

export const actualizarTablero = async (id, data) => {
  const formData = objectToFormData(data);
  const res = await api.put(`/tableros/${id}`, formData);
  return res.data;
};

export const eliminarTablero = async (id, id_usuario) => {
  const res = await api.delete(`/tableros/${id}`, {
    params: { id_usuario }
  });
  return res.data;
};
