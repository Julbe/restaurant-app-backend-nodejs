import express from "express";
import { Manager } from "../managerController.js";

const modifierRoute = express.Router();


modifierRoute.post("/", Manager.Combo.create);
modifierRoute.get("/", Manager.Combo.getAll);
modifierRoute.get("/:id", Manager.Combo.getById);
modifierRoute.put("/:id", Manager.Combo.update);
modifierRoute.delete("/:id", Manager.Combo.delete);

export default modifierRoute;
