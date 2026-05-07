import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const productRoute = express.Router();

productRoute.post("/", verifyToken, Manager.Product.create);
productRoute.get("/", verifyToken, Manager.Product.getAll);
productRoute.get("/:id", verifyToken, Manager.Product.getById);
productRoute.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Product.update);
productRoute.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Product.delete);

export default productRoute;
