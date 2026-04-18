import express from "express";
import { Manager } from "../manager.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const roleRoute = express.Router();

roleRoute.post("/", verifyToken, Manager.Session.create);
roleRoute.get("/", verifyToken, Manager.Session.getAll);
roleRoute.get("/:id", verifyToken, Manager.Session.getById);
roleRoute.put("/:id", verifyToken, Manager.Session.update);
roleRoute.patch("/:id", verifyToken, Manager.Session.closeSession);
roleRoute.delete("/:id", verifyToken, Manager.Session.delete);

export default roleRoute;