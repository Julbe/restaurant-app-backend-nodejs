import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { Manager } from "../managerController.js";

const route = express.Router();

route.post("/facturapi/process", Manager.Invoice.processFacturapi);
route.post("/:id/send-email", Manager.Invoice.sendByEmail);
route.get("/:id/:format", Manager.Invoice.downloadFile);
route.get("/:id", Manager.Invoice.getById);

export default route;
