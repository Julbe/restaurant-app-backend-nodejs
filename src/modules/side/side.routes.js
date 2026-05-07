import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { PRIVILEGES } from "../../config/privileges.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";

const modifierRoute = express.Router();


modifierRoute.post("/", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Side.create);
modifierRoute.get("/", verifyToken, Manager.Side.getAll);
modifierRoute.get("/:id", verifyToken, Manager.Side.getById);
modifierRoute.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Side.update);
modifierRoute.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Side.delete);

export default modifierRoute;
