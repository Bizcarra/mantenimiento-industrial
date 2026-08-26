import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
});

// Interceptor para agregar token a las requests
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

// Endpoints de tickets
export const ticketsAPI = {
  listar: (filtros = {}) => apiClient.get('/tickets', { params: filtros }),
  crear: (datos) => apiClient.post('/tickets', datos),
  obtener: (id) => apiClient.get(`/tickets/${id}`),
  asignar: (id, tecnicoAsignado) => apiClient.patch(`/tickets/${id}/asignar`, { tecnicoAsignado }),
  cambiarEstado: (id, nuevoEstado) => apiClient.patch(`/tickets/${id}/estado`, { nuevoEstado }),
  cambiarPrioridad: (id, nuevaPrioridad) => apiClient.patch(`/tickets/${id}/prioridad`, { nuevaPrioridad }),
  registrarSolucion: (id, descripcionSolucion) => apiClient.patch(`/tickets/${id}/solucion`, { descripcionSolucion }),
  finalizarTicket: (id, descripcionSolucion) =>
    apiClient.patch(`/tickets/${id}/finalizacion`, { descripcionSolucion }),
};

// Endpoints de usuarios
export const usuariosAPI = {
  obtenerTecnicos: () => apiClient.get('/auth/tecnicos'),
};

// Endpoints de dashboard
export const dashboardAPI = {
  stats: () => apiClient.get('/dashboard/stats'),
  desempenioTecnicos: () => apiClient.get('/dashboard/tecnicos-desempenio'),
};
