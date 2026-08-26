import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Login.module.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await login(email, password);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🔧 Sistema de Mantenimiento</h1>
        <p>Ingresa tus credenciales</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.grupo}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.grupo}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={cargando} className={styles.boton}>
            {cargando ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.demo}>
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Admin: admin@mantenimiento.com / admin123</p>
          <p>Técnico: juan@mantenimiento.com / tecnico123</p>
          <p>Solicitante: pedro@empresa.com / user123</p>
        </div>
      </div>
    </div>
  );
};
