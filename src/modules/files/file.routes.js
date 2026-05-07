import express from "express";

import { Manager } from "../managerController.js";
import { singleFile } from "../../middlewares/uploadMulter.middleware.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const route = express.Router();

route.post("/singleFile", verifyToken, requirePrivilege(PRIVILEGES.MANAGE_FILES), singleFile('file', Manager.File.create));
route.get("/", verifyToken, Manager.File.getAll);
route.get("/:id", verifyToken, Manager.File.getById);
route.patch("/:id", verifyToken, requirePrivilege(PRIVILEGES.MANAGE_FILES), singleFile('file', Manager.File.update));
route.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.MANAGE_FILES), Manager.File.delete);

route.put("/getUrlFromKey/", Manager.File.getUrlFromKey);



export default route;
