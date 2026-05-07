import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const roleRoute = express.Router();

roleRoute.post("/", verifyToken, requirePrivilege(PRIVILEGES.ROLES_CREATE), Manager.Role.create);
roleRoute.get("/", verifyToken, Manager.Role.getAll);
roleRoute.get("/:id", verifyToken, Manager.Role.getById);
roleRoute.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.ROLES_UPDATE), Manager.Role.update);
roleRoute.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.ROLES_DELETE), Manager.Role.delete);

export default roleRoute;
