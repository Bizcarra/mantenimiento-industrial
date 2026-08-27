import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { usuariosAPI } from '../services/api';
import styles from './Usuarios.module.css';

const formularioInicial = {
  nombre: '',
  email: '',
  password: '',
  rol: 'solicitante',
  area: '',
  activo: true,
};

const etiquetasRol = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  solicitante: 'Solicitante',
};

export const Usuarios = () => {
  const { usuario: usuarioActual } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError('');
      const response = await usuariosAPI.listar({
        q: busqueda.trim() || undefined,
        rol: filtroRol || undefined,
        activo: filtroActivo || undefined,
      });
      setUsuarios(response.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const temporizador = setTimeout(cargarUsuarios, 300);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, filtroRol, filtroActivo]);

  const abrirNuevo = () => {
    setUsuarioEditado(null);
    setFormulario(formularioInicial);
    setError('');
    setModalAbierto(true);
  };

  const abrirEdicion = (usuario) => {
    setUsuarioEditado(usuario);
    setFormulario({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      area: usuario.area || '',
      activo: usuario.activo,
    });
    setError('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setUsuarioEditado(null);
    setFormulario(formularioInicial);
  };

  const actualizarCampo = (event) => {
    const { name, value, type, checked } = event.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const guardarUsuario = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const datos = { ...formulario };
      if (usuarioEditado && !datos.password) delete datos.password;

      const response = usuarioEditado
        ? await usuariosAPI.actualizar(usuarioEditado._id, datos)
        : await usuariosAPI.crear(datos);

      setMensaje(response.data.mensaje);
      setModalAbierto(false);
      setUsuarioEditado(null);
      setFormulario(formularioInicial);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (usuario) => {
    const confirmado = window.confirm(
      `¿Eliminar definitivamente a ${usuario.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      setError('');
      setMensaje('');
      const response = await usuariosAPI.eliminar(usuario._id);
      setMensaje(response.data.mensaje);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No fue posible eliminar el usuario');
    }
  };

  const activos = usuarios.filter((usuario) => usuario.activo).length;
  const esCuentaPropia = usuarioEditado?._id === usuarioActual?._id;

  return (
    <main className={styles.container}>
      <header className={styles.encabezado}>
        <div>
          <p className={styles.eyebrow}>Administración</p>
          <h1>Gestión de usuarios</h1>
          <p className={styles.descripcion}>
            Busca, crea y administra los accesos al sistema de mantenimiento.
          </p>
        </div>
        <button type="button" className={styles.botonPrimario} onClick={abrirNuevo}>
          + Nuevo usuario
        </button>
      </header>

      <section className={styles.resumen} aria-label="Resumen de usuarios">
        <div><strong>{usuarios.length}</strong><span>Resultados</span></div>
        <div><strong>{activos}</strong><span>Activos</span></div>
        <div><strong>{usuarios.length - activos}</strong><span>Inactivos</span></div>
      </section>

      {mensaje && <div className={styles.exito}>{mensaje}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.panel}>
        <div className={styles.filtros}>
          <label className={styles.busqueda}>
            <span>Buscar usuario</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Nombre, email o área"
            />
          </label>
          <label>
            <span>Rol</span>
            <select value={filtroRol} onChange={(event) => setFiltroRol(event.target.value)}>
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="tecnico">Técnico</option>
              <option value="solicitante">Solicitante</option>
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={filtroActivo} onChange={(event) => setFiltroActivo(event.target.value)}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
        </div>

        {cargando ? (
          <div className={styles.estadoVacio}>Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className={styles.estadoVacio}>No se encontraron usuarios con esos filtros.</div>
        ) : (
          <div className={styles.tablaContenedor}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Área</th>
                  <th>Estado</th>
                  <th><span className={styles.soloLectores}>Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario._id}>
                    <td>
                      <div className={styles.identidad}>
                        <span className={styles.avatar}>{usuario.nombre.charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{usuario.nombre}</strong>
                          <span>{usuario.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`${styles.rol} ${styles[usuario.rol]}`}>{etiquetasRol[usuario.rol]}</span></td>
                    <td>{usuario.area || 'Sin área'}</td>
                    <td>
                      <span className={usuario.activo ? styles.activo : styles.inactivo}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.acciones}>
                        <button type="button" onClick={() => abrirEdicion(usuario)}>Editar</button>
                        <button
                          type="button"
                          className={styles.eliminar}
                          onClick={() => eliminarUsuario(usuario)}
                          disabled={usuario._id === usuarioActual?._id}
                          title={usuario._id === usuarioActual?._id ? 'No puedes eliminar tu propia cuenta' : ''}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className={styles.modalFondo} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cerrarModal();
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
            <div className={styles.modalEncabezado}>
              <div>
                <p className={styles.eyebrow}>{usuarioEditado ? 'Modificar acceso' : 'Crear acceso'}</p>
                <h2 id="titulo-modal">{usuarioEditado ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              </div>
              <button type="button" className={styles.cerrar} onClick={cerrarModal} aria-label="Cerrar">×</button>
            </div>

            <form onSubmit={guardarUsuario}>
              <div className={styles.campos}>
                <label>
                  <span>Nombre completo</span>
                  <input name="nombre" value={formulario.nombre} onChange={actualizarCampo} required />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" value={formulario.email} onChange={actualizarCampo} required />
                </label>
                <label>
                  <span>{usuarioEditado ? 'Nueva contraseña (opcional)' : 'Contraseña'}</span>
                  <input
                    name="password"
                    type="password"
                    value={formulario.password}
                    onChange={actualizarCampo}
                    minLength={10}
                    maxLength={72}
                    required={!usuarioEditado}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  <span>Rol</span>
                  <select name="rol" value={formulario.rol} onChange={actualizarCampo} disabled={esCuentaPropia}>
                    <option value="solicitante">Solicitante</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
                <label className={styles.campoCompleto}>
                  <span>Área</span>
                  <input name="area" value={formulario.area} onChange={actualizarCampo} placeholder="Ej.: Producción" />
                </label>
                <label className={`${styles.campoCompleto} ${styles.check}`}>
                  <input
                    name="activo"
                    type="checkbox"
                    checked={formulario.activo}
                    onChange={actualizarCampo}
                    disabled={esCuentaPropia}
                  />
                  <span>Usuario activo y autorizado para iniciar sesión</span>
                </label>
              </div>

              {error && <div className={styles.errorModal}>{error}</div>}

              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className={styles.botonPrimario} disabled={guardando}>
                  {guardando ? 'Guardando...' : usuarioEditado ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};
