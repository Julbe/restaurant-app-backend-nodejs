import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { Manager } from "../managerController.js";

const route = express.Router();

route.post("/", verifyToken, Manager.BillingCustomer.create);
route.get("/", verifyToken, Manager.BillingCustomer.getAll);
route.get("/search/:searchValue", Manager.BillingCustomer.search);
route.get("/:id", verifyToken, Manager.BillingCustomer.getById);
route.put("/:id", verifyToken, Manager.BillingCustomer.update);
route.delete("/:id", verifyToken, Manager.BillingCustomer.delete);

export default route;
