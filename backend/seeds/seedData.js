import mongoose from 'mongoose';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    const confirmado =
      process.argv.includes('--confirm-reset-local-data') ||
      process.env.ALLOW_DESTRUCTIVE_DB_TASKS === 'true';

    if (process.env.NODE_ENV === 'production' || !confirmado) {
      throw new Error(
        'Seed bloqueado. Usa --confirm-reset-local-data fuera de producción para confirmar el borrado'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Limpiar base de datos
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Crear usuarios
    const users = [
      {
        nombre: 'Admin',
        email: 'admin@mantenimiento.com',
        password: 'admin123',
        rol: 'admin',
        area: 'Administración',
      },
      {
        nombre: 'Juan Técnico',
        email: 'juan@mantenimiento.com',
        password: 'tecnico123',
        rol: 'tecnico',
        area: 'Producción',
      },
      {
        nombre: 'María Técnico',
        email: 'maria@mantenimiento.com',
        password: 'tecnico123',
        rol: 'tecnico',
        area: 'Eléctrica',
      },
      {
        nombre: 'Pedro Solicitante',
        email: 'pedro@empresa.com',
        password: 'user123',
        rol: 'solicitante',
        area: 'Producción',
      },
      {
        nombre: 'Laura Solicitante',
        email: 'laura@empresa.com',
        password: 'user123',
        rol: 'solicitante',
        area: 'Almacén',
      },
    ];

    // Crear usuarios uno por uno para que se encripten las contraseñas
    const usuariosCreados = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      usuariosCreados.push(user);
    }
    console.log(`✓ ${usuariosCreados.length} usuarios creados`);

    // Crear tickets de ejemplo (uno por uno para evitar duplicados en numeroTicket)
    const ticketsData = [
      {
        titulo: 'Máquina CNC no enciende',
        descripcion: 'La máquina CNC de la línea 1 no enciende. Se escuchan ruidos extraños en el motor.',
        estado: 'abierto',
        prioridad: 'critica',
        area: 'Producción',
        solicitante: usuariosCreados[3]._id,
        tecnicoAsignado: null,
      },
      {
        titulo: 'Bomba hidráulica con fuga',
        descripcion: 'La bomba hidráulica del taller presenta una fuga de aceite importante.',
        estado: 'en_progreso',
        prioridad: 'alta',
        area: 'Producción',
        solicitante: usuariosCreados[3]._id,
        tecnicoAsignado: usuariosCreados[1]._id,
        fechaAsignacion: new Date(),
      },
      {
        titulo: 'Revisión de transformador',
        descripcion: 'Revisión preventiva del transformador principal antes del mantenimiento programado.',
        estado: 'abierto',
        prioridad: 'media',
        area: 'Eléctrica',
        solicitante: usuariosCreados[4]._id,
        tecnicoAsignado: null,
      },
      {
        titulo: 'Reemplazo de motor en cinta transportadora',
        descripcion: 'El motor de la cinta transportadora está desgastado y necesita reemplazo.',
        estado: 'resuelto',
        prioridad: 'alta',
        area: 'Almacén',
        solicitante: usuariosCreados[4]._id,
        tecnicoAsignado: usuariosCreados[2]._id,
        fechaAsignacion: new Date(Date.now() - 86400000),
        fechaResolucion: new Date(),
      },
      {
        titulo: 'Calibración de sensor de temperatura',
        descripcion: 'El sensor de temperatura del horno no está marcando correctamente.',
        estado: 'pausado',
        prioridad: 'baja',
        area: 'Producción',
        solicitante: usuariosCreados[3]._id,
        tecnicoAsignado: usuariosCreados[1]._id,
        fechaAsignacion: new Date(Date.now() - 172800000),
      },
    ];

    // Insertar tickets uno por uno
    let ticketsCreados = 0;
    for (const ticketData of ticketsData) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      ticketsCreados++;
    }
    console.log(`✓ ${ticketsCreados} tickets creados`);

    console.log('✓ Base de datos inicializada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar BD:', error);
    process.exit(1);
  }
}

seedDatabase();
