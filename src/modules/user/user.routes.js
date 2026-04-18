import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const userRoute = express.Router();

userRoute.post("/", verifyToken, Manager.User.create);
userRoute.get("/", verifyToken, Manager.User.getAll);
userRoute.get("/:id", verifyToken, Manager.User.getById);
userRoute.put("/:id", verifyToken, verifyToken, Manager.User.update);
userRoute.delete("/:id", verifyToken, Manager.User.delete);


userRoute.put("/updatePassword/:id", verifyToken, verifyToken, Manager.User.setNewPassword);


export default userRoute;
