import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const productRoute = express.Router();

productRoute.post("/", verifyToken, Manager.Product.create);
productRoute.get("/", verifyToken, Manager.Product.getAll);
productRoute.get("/:id", verifyToken, Manager.Product.getById);
productRoute.put("/:id", verifyToken, Manager.Product.update);
productRoute.delete("/:id", verifyToken, Manager.Product.delete);

export default productRoute;
