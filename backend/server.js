import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validarConfiguracionSegura } from './middleware/security.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST ||
  (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const iniciarServidor = async () => {
  try {
    validarConfiguracionSegura();
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`No fue posible iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

iniciarServidor();
