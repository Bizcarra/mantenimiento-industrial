import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  // Verificar token al cargar la app
  useEffect(() => {
    if (token) {
      verificarToken();
    } else {
      setCargando(false);
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const response = await axios.post('/api/auth/login', { email, password });
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem('token', nuevoToken);

    return nuevoUsuario;
  };

  const registro = async (nombre, email, password, rol, area) => {
    const response = await axios.post('/api/auth/registro', {
      nombre,
      email,
      password,
      rol,
      area,
    });
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
