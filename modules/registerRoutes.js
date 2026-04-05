import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerRoutes = (app, apiPrefix = "/api", endFiles = ".routes.js") => {
  const modulesPath = __dirname; 

  // Leer todas las carpetas dentro de modules/
  const moduleDirs = fs.readdirSync(modulesPath).filter((dir) =>
    fs.statSync(path.join(modulesPath, dir)).isDirectory()
  );

  for (const dir of moduleDirs) {
    // Buscar archivo de rutas en cada módulo
    const routeFile = fs.readdirSync(path.join(modulesPath, dir))
      .find((file) => file.endsWith(endFiles));

    if (!routeFile) continue;

    const routePath = path.join(modulesPath, dir, routeFile);
    import(routePath).then((module) => {
      const router = module.default;
      if (!router) return;

      // Montar ruta usando el nombre de la carpeta
      const routePrefix = `${apiPrefix}/${dir}`;
      app.use(routePrefix, router);

      console.log(`🚀 Ruta: [${routePrefix}] -> ${routeFile}`);
    });
  }
};
