import express from "express";
import { Manager } from "../manager.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const roleRoute = express.Router();

roleRoute.post("/", verifyToken, Manager.Role.create);
roleRoute.get("/", verifyToken, Manager.Role.getAll);
roleRoute.get("/:id", verifyToken, Manager.Role.getById);
roleRoute.put("/:id", verifyToken, Manager.Role.update);
roleRoute.delete("/:id", verifyToken, Manager.Role.delete);

export default roleRoute;
