import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DESTRUCTIVE_DB_TASKS !== 'true') {
      throw new Error(
        'Operación bloqueada. Solo se permite fuera de producción con ALLOW_DESTRUCTIVE_DB_TASKS=true'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    await mongoose.connection.db.dropDatabase();
    console.log('✓ Base de datos limpiada');
    
    await mongoose.disconnect();
    console.log('✓ Desconectado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
