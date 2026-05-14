import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const route = express.Router();

route.post("/", verifyToken, requirePrivilege(PRIVILEGES.DIGITAL_MENU), Manager.Table.create);
route.get("/", verifyToken, Manager.Table.getAll);
route.get("/:id", verifyToken, Manager.Table.getById);
route.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Table.update);
route.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.Table.delete);

export default route;
