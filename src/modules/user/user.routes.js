import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const userRoute = express.Router();

userRoute.post("/", verifyToken, requirePrivilege(PRIVILEGES.USERS), Manager.User.create);
userRoute.get("/", verifyToken, Manager.User.getAll);
userRoute.get("/:id", verifyToken, Manager.User.getById);
userRoute.put("/:id", verifyToken, requirePrivilege(PRIVILEGES.USERS), Manager.User.update);
userRoute.delete("/:id", verifyToken, requirePrivilege(PRIVILEGES.USERS), Manager.User.delete);

userRoute.put("/updatePassword/:id", verifyToken, Manager.User.setNewPassword);
userRoute.patch("/resetPassword/:id", verifyToken, requirePrivilege(PRIVILEGES.USERS), Manager.User.resetPassword);

export default userRoute;
