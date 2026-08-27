import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error conectando a MongoDB', {
      nombre: error.name,
      codigo: error.code || 'sin-codigo',
    });
    throw new Error('No fue posible conectar a MongoDB', { cause: error });
  }
};
