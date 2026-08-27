import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validarConfiguracionSegura } from './middleware/security.js';

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    validarConfiguracionSegura();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error(`No fue posible iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

iniciarServidor();
