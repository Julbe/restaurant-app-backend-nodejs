import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const modifierRoute = express.Router();


modifierRoute.post("/", verifyToken, requirePrivilege(PRIVILEGES.DIGITAL_MENU), Manager.Combo.create);
modifierRoute.get("/", verifyToken, Manager.Combo.getAll);
modifierRoute.get("/:id", verifyToken, Manager.Combo.getById);
modifierRoute.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Combo.update);
modifierRoute.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Combo.delete);

export default modifierRoute;
