
import { registerRoutes } from "./registerRoutes.js";
import { PRIVILEGES } from "../config/privileges.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requirePrivilege } from "../middlewares/requirePrivilege.js";

export const setupRoutes = (app) => {
    const API_ROUTE = "/api";
    app.get(API_ROUTE, (req, res) => {
        res.status(200).send({
            serverName: "Restaurant service",
            environment: process.env.PRODUCTION || false,
            version: "1.0.0",
            releaseDate: "2025",
            message: "",
        });
    });

    app.get(
        API_ROUTE + "/token",
        verifyToken,
        requirePrivilege(PRIVILEGES.USERS, PRIVILEGES.ROLES),
        (req, res) => {
            res.status(200).send({
                environment: process.env.PRODUCTION || false,
                version: "0.0.0",
                releaseDate: "2025",
                message: "Token validado correctamente",
                user: req.user,
            });
        }
    );

    // Registrar automáticamente todas las rutas de modules /*
    registerRoutes(app, API_ROUTE);
};
