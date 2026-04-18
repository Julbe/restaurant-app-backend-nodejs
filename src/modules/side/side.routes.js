import express from "express";
import { Manager } from "../manager.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const modifierRoute = express.Router();


modifierRoute.post("/", verifyToken, Manager.Side.create);
modifierRoute.get("/", verifyToken, Manager.Side.getAll);
modifierRoute.get("/:id", verifyToken, Manager.Side.getById);
modifierRoute.put("/:id", verifyToken, Manager.Side.update);
modifierRoute.delete("/:id", verifyToken, Manager.Side.delete);

export default modifierRoute;
