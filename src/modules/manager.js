import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const Manager = {};

const modulesPath = __dirname; // src/modules

// Leer todas las carpetas de modules/
const moduleDirs = fs
    .readdirSync(modulesPath)
    .filter((dir) =>
    fs.statSync(path.join(modulesPath, dir)).isDirectory()
);
console.log("🟡 Adding controllers...")
for (const dir of moduleDirs) {
    const controllerFile = fs
    .readdirSync(path.join(modulesPath, dir))
    .find((file) => file.endsWith(".controller.js"));

    if (!controllerFile) continue;
    const modulePath = path.join(modulesPath, dir, controllerFile);
    const { default: ControllerClass } = await import(modulePath);
    if (ControllerClass) {
        // Crear nombre en PascalCase (Products → Product, Sessions → Session)
        const key =
        dir.charAt(0).toUpperCase() + dir.slice(1).replace(/s$/, "");
        console.log(`✅ ${key}`)
        Manager[key] = new ControllerClass();
    }
}
