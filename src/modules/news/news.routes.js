import express from "express";

import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";


const route = express.Router();

route.post("/", verifyToken, requirePrivilege(PRIVILEGES.NEWS_CREATE), Manager.New.create);
route.get("/", Manager.New.getAll);
route.get("/find/visible/", Manager.New.findVisible);
route.post("/:id/view", Manager.New.incrementViews);
route.post("/:id/click", Manager.New.incrementClicks);
route.get("/:id", Manager.New.getById);
route.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.NEWS_UPDATE), Manager.New.update);
route.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.NEWS_DELETE), Manager.New.delete);




export default route;
