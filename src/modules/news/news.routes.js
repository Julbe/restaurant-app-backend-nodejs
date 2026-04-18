import express from "express";

import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";


const route = express.Router();

route.post("/", verifyToken, Manager.New.create);
route.get("/", Manager.New.getAll);
route.get("/:id", Manager.New.getById);
route.patch("/:id", verifyToken, Manager.New.update);
route.delete("/:id", verifyToken, Manager.New.delete);


route.get("/find/visible/", Manager.New.findVisible);




export default route;
