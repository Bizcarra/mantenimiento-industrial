import axios from 'axios';

const backendConfigurado = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ||
  'https://mantenimiento-industrial-production.up.railway.app';
const usarMismoOrigen = import.meta.env.DEV ||
  import.meta.env.VITE_SAME_ORIGIN === 'true';
const apiBaseUrl = usarMismoOrigen ? '/api' : `${backendConfigurado}/api`;

export const apiClient = axios.create({
  // Desarrollo y red local comparten origen; el despliegue separado usa VITE_API_URL.
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get('/auth/me'),
  registro: (nombre, email, password, area) =>
    apiClient.post('/auth/registro', { nombre, email, password, area }),
};
export const ticketsAPI = {
  listar: (filtros = {}) => apiClient.get('/tickets', { params: filtros }),
  crear: (datos) => apiClient.post('/tickets', datos),
  eliminar: (id) => apiClient.delete(`/tickets/${id}`),
  obtener: (id) => apiClient.get(`/tickets/${id}`),
  asignar: (id, tecnicoAsignado) => apiClient.patch(`/tickets/${id}/asignar`, { tecnicoAsignado }),
  cambiarEstado: (id, nuevoEstado) => apiClient.patch(`/tickets/${id}/estado`, { nuevoEstado }),
  cambiarPrioridad: (id, nuevaPrioridad) => apiClient.patch(`/tickets/${id}/prioridad`, { nuevaPrioridad }),
  registrarSolucion: (id, descripcionSolucion) => apiClient.patch(`/tickets/${id}/solucion`, { descripcionSolucion }),
  finalizarTicket: (id, descripcionSolucion) =>
    apiClient.patch(`/tickets/${id}/finalizacion`, { descripcionSolucion }),
};

export const usuariosAPI = {
  obtenerTecnicos: () => apiClient.get('/auth/tecnicos'),
  listar: (filtros = {}) => apiClient.get('/users', { params: filtros }),
  sugerirEmail: (primerNombre, primerApellido) =>
    apiClient.get('/users/sugerir-email', { params: { primerNombre, primerApellido } }),
  crear: (datos) => apiClient.post('/users', datos),
  actualizar: (id, datos) => apiClient.patch(`/users/${id}`, datos),
  eliminar: (id) => apiClient.delete(`/users/${id}`),
};

export const dashboardAPI = {
  stats: (filtros = {}) => apiClient.get('/dashboard/stats', { params: filtros }),
  desempenioTecnicos: (filtros = {}) =>
    apiClient.get('/dashboard/tecnicos-desempenio', { params: filtros }),
};
