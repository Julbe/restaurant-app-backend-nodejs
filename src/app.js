import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.DB_CONNECTION;

import connectDB from './db.js';
import { setupRoutes } from "./modules/api_router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { wrapResponse } from "./middlewares/wrapResponse.js";
import { Manager } from "./modules/managerController.js";

// Ruta básica

console.log("Controladores cargados:", Object.keys(Manager));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor Restaurant Node.js 🚀",
    info: {
      autor: "Julio B.",
      ambiente: process.env.NODE_ENV || "no definida",
      tiempo: new Date(),
    },
  });
});

app.use(cors());
app.use(express.json());

app.use(wrapResponse);
setupRoutes(app);
app.use(errorHandler);

connectDB();

// Levantar servidor
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
