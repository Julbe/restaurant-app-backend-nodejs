import express from "express";
import { Manager } from "../managerController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const route = express.Router();

route.post("/", verifyToken, Manager.Ticket.create);
route.get("/", verifyToken, Manager.Ticket.getAll);
route.get("/:id", verifyToken, Manager.Ticket.getById);
route.post("/:id/cancel", verifyToken, Manager.Ticket.cancelTicket);
route.put("/:id", verifyToken, Manager.Ticket.update);
route.delete("/:id", verifyToken, Manager.Ticket.delete);

export default route;
