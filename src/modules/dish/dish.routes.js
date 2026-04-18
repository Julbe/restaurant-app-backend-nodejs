import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const modifierRoute = express.Router();

modifierRoute.post("/", verifyToken, Manager.Dish.create);
modifierRoute.get("/", verifyToken, Manager.Dish.getAll);
modifierRoute.get("/:id", verifyToken, Manager.Dish.getById);
modifierRoute.put("/:id", verifyToken, Manager.Dish.update);
modifierRoute.delete("/:id", verifyToken, Manager.Dish.delete);

export default modifierRoute;
