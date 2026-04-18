import express from "express";

import { Manager } from "../manager.js";
import { singleFile } from "../../middlewares/uploadMulter.middleware.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const route = express.Router();

route.post("/singleFile", verifyToken, singleFile('file', Manager.File.create));
route.get("/", verifyToken, Manager.File.getAll);
route.get("/:id", verifyToken, Manager.File.getById);
route.patch("/:id", verifyToken, singleFile('file', Manager.File.update));
route.delete("/:id", verifyToken, Manager.File.delete);

route.put("/getUrlFromKey/", Manager.File.getUrlFromKey);



export default route;