import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const crearAdministradorInicial = async () => {
  try {
    const nombre = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (
      !nombre ||
      nombre.length > 120 ||
      !email ||
      email.length > 254 ||
      !EMAIL_VALIDO.test(email) ||
      typeof password !== 'string' ||
      password.length < 10 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new Error(
        'Define ADMIN_NAME, ADMIN_EMAIL y una ADMIN_PASSWORD de entre 10 y 72 bytes'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

    if (await User.exists({ rol: 'admin', activo: true })) {
      throw new Error('Ya existe un administrador activo; utiliza el panel de usuarios');
    }

    await User.create({
      nombre,
      email,
      password,
      rol: 'admin',
      area: 'Administración',
      activo: true,
    });

    console.log('Administrador inicial creado. Elimina ADMIN_PASSWORD de las variables del servicio.');
  } catch (error) {
    console.error(`No fue posible crear el administrador inicial: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

crearAdministradorInicial();
