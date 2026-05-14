import BaseController from "../baseController.js";
import { Order } from "./order.model.js";

export default class OrderController extends BaseController {
    constructor() {
        super(
            Order,
            "Orden",
            ["notes"],
            ["createdBy", "dishes"],
            ["createdBy", "dishes"]
        );
    }
}
