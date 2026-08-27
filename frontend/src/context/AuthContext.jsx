import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (token) {
      verificarToken();
    } else {
      setCargando(false);
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      const response = await authAPI.me();
      setUsuario(response.data);
    } catch (error) {
      console.error('Token inválido:', error);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setCargando(false);
    }
  };

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
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
