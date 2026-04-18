import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const route = express.Router();

route.post("/", verifyToken, Manager.Employee.create);
route.get("/", verifyToken, Manager.Employee.getAll);
route.get("/:id", verifyToken, Manager.Employee.getById);
route.put("/:id", verifyToken, Manager.Employee.update);
route.delete("/:id", verifyToken, Manager.Employee.delete);

export default route;
