import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  const limpiarSesion = useCallback(() => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const verificarToken = useCallback(async ({ silencioso = false } = {}) => {
    try {
      const response = await authAPI.me();
      setUsuario(response.data);
    } catch (error) {
      const estado = error.response?.status;
      if (estado === 401 || estado === 403) {
        limpiarSesion();
      } else {
        console.error('No fue posible actualizar la sesión:', error);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [limpiarSesion]);

  useEffect(() => {
    if (token) {
      verificarToken();
    } else {
      setCargando(false);
    }
  }, [token, verificarToken]);

  useAutoRefresh(
    () => verificarToken({ silencioso: true }),
    { activo: Boolean(token), intervalo: 60000 }
  );

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem('token', nuevoToken);

    return nuevoUsuario;
  };

  const registro = async (nombre, email, password, area) => {
    const response = await authAPI.registro(nombre, email, password, area);
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem('token', nuevoToken);

    return nuevoUsuario;
  };

  const logout = () => {
    limpiarSesion();
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
