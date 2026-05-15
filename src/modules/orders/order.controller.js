import BaseController from "../baseController.js";
import { getDailySequenceKey } from "../../utils/generateCodes.js";
import { Ticket } from "../tickets/ticket.model.js";
import { Order } from "./order.model.js";
import { OrderCounter } from "./orderCounter.model.js";

const orderPopulate = [
    {
        path: "ticketId",
        populate: [
            { path: "tableId" },
            { path: "waiterId" },
        ],
    },
    "createdBy",
    "items.dishId",
    "items.selectedModifiers.modifierId",
];


export default class OrderController extends BaseController {
    constructor() {
        super(
            Order,
            "Orden",
            ["notes", "code_order", "orderDateKey"],
            orderPopulate,
            orderPopulate,
            [],
            { "createdBy": "user" }
        );
    }

    async beforeCreate(req) {

        const orderDateKey = getDailySequenceKey("O");
        const counter = await OrderCounter.findOneAndUpdate(
            { dateKey: orderDateKey },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return {
            ...req.body,
            orderDateKey,
            orderNumber: counter.seq,
            code_order: String(counter.seq),
        };
    }

    async beforeUpdate(req) {
        const data = { ...req.body };
        delete data.orderDateKey;
        delete data.orderNumber;
        delete data.code_order;

        return data;
    }
}
