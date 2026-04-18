import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.DB_CONNECTION;

console.log("FROM DB", URI)
const options = {
  maxPoolSize: 10,
  wtimeoutMS: 2500,
  socketTimeoutMS: 30000, // Ajusta al tiempo de espera del Lambda
  connectTimeoutMS: 30000 // Ajusta al tiempo de espera del Lambda
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

let isConnected = false; // 👈 Nueva bandera de conexión

const connectDB = async (retries = MAX_RETRIES) => {
  if (isConnected) {
    console.log('👈 Ya está conectado, evita reconectar');
    return; // 👈 Ya está conectado, evita reconectar
  }

  try {
    console.log('🔗 Intentando conectar a MongoDB...');
    await mongoose.connect(URI, options);
    isConnected = true;
    console.log('💾  Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB', err);
    if (retries > 0) {
      console.log(`Reintento de conexión en ${RETRY_DELAY / 1000} segundos... Quedan ${retries - 1} reintentos.`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    } else {
      console.error('Todos los intentos de conexión fallaron. Terminando proceso.');
      process.exit(1);
    }
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`Recibido ${signal}. Cerrando conexiones de MongoDB...`);
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error cerrando conexión de MongoDB:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  console.error('Excepción no controlada:', err);
  gracefulShutdown('uncaughtException');
});


export default connectDB;
