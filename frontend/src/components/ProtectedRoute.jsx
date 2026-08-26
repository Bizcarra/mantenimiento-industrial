import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './ProtectedRoute.module.css';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { usuario, cargando, token } = useContext(AuthContext);

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
