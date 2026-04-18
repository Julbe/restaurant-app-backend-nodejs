import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const modifierRoute = express.Router();


modifierRoute.post("/", verifyToken, Manager.Modifier.create);
modifierRoute.get("/", verifyToken, Manager.Modifier.getAll);
modifierRoute.get("/:id", verifyToken, Manager.Modifier.getById);
modifierRoute.put("/:id", verifyToken, Manager.Modifier.update);
modifierRoute.delete("/:id", verifyToken, Manager.Modifier.delete);

export default modifierRoute;
