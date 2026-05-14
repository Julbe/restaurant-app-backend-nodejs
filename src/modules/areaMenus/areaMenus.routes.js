import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const route = express.Router();

route.post("/", verifyToken, Manager.AreaMenu.create);
route.get("/", Manager.AreaMenu.getAll);
route.get("/:id", verifyToken, Manager.AreaMenu.getById);
route.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.AreaMenu.update);
route.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.UPDATE_MENU), Manager.AreaMenu.delete);

export default route;
