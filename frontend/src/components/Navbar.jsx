import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🔧 Mantenimiento
        </Link>

        <div className={styles.menu}>
          <Link to="/tickets" className={styles.link}>
            Tickets
          </Link>

          {usuario?.rol === 'admin' && (
            <Link to="/dashboard" className={styles.link}>
              Dashboard
            </Link>
          )}

          <div className={styles.usuario}>
            <span>{usuario?.nombre}</span>
            <span className={styles.rol}>{usuario?.rol}</span>
            <button onClick={handleLogout} className={styles.logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
