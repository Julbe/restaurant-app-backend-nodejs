import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const route = express.Router();

route.post("/", verifyToken, Manager.Order.create);
route.get("/", verifyToken, Manager.Order.getAll);
route.get("/:id", verifyToken, Manager.Order.getById);
route.put("/:id", verifyToken, Manager.Order.update);
route.delete("/:id", verifyToken, Manager.Order.delete);

export default route;
