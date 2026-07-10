import axios from "axios";

const api = axios.create({
  baseURL: window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api",
});

api.interceptors.request.use(
  (config) => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario && usuario.token) {
          config.headers["Authorization"] = `Bearer ${usuario.token}`;
        }
      } catch (error) {
        console.error("Error parsing user from localStorage in api interceptor", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;