import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const route = express.Router();

route.post("/", verifyToken, Manager.AreaMenu.create);
route.get("/", verifyToken, Manager.AreaMenu.getAll);
route.get("/:id", verifyToken, Manager.AreaMenu.getById);
route.put("/:id", verifyToken, Manager.AreaMenu.update);
route.delete("/:id", verifyToken, Manager.AreaMenu.delete);

export default route;
