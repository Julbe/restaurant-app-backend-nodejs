import BaseController from "../baseController.js";
import { getDailySequenceKey } from "../../utils/generateCodes.js";
import { Ticket } from "../tickets/ticket.model.js";
import { Order } from "./order.model.js";
import { OrderCounter } from "./orderCounter.model.js";

const SERVICE_TYPES = ["takeOut", "here"];

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeOrderPayload = async (payload = {}, currentOrder = null) => {
    const data = { ...payload };
    const ticketId = data.ticketId ?? currentOrder?.ticketId;

    if (!ticketId) {
        throw createHttpError("ticketId es requerido.", 400);
    }

    const ticket = await Ticket.findById(ticketId).select("serviceType");
    if (!ticket) {
        throw createHttpError("El ticket indicado no existe.", 400);
    }

    const serviceType = data.serviceType ?? currentOrder?.serviceType ?? ticket.serviceType ?? "here";
    if (!SERVICE_TYPES.includes(serviceType)) {
        throw createHttpError("serviceType inválido. Usa 'takeOut' o 'here'.", 400);
    }

    data.ticketId = ticket._id;
    data.serviceType = serviceType;

    return data;
};

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
    "items.dishId.areaMenu_id",
    "items.selectedModifiers.modifierId",
    "items.selectedGroups.options.dishId",
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
            {
                "createdBy": "user",
                "items.dishId.areaMenu_id": {
                    path: "items.dishId",
                    populate: {
                        path: "areaMenu_id",
                    },
                },
            }
        );
    }

    async beforeCreate(req) {
        const data = await normalizeOrderPayload(req.body);

        const orderDateKey = getDailySequenceKey("O");
        const counter = await OrderCounter.findOneAndUpdate(
            { dateKey: orderDateKey },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return {
            ...data,
            orderDateKey,
            orderNumber: counter.seq,
            code_order: String(counter.seq),
        };
    }

    async beforeUpdate(req) {
        const currentOrder = await Order.findById(req.params.id).select("ticketId serviceType");
        if (!currentOrder) {
            throw createHttpError("No encontrado", 404);
        }

        const data = await normalizeOrderPayload(req.body, currentOrder);
        delete data.orderDateKey;
        delete data.orderNumber;
        delete data.code_order;

        return data;
    }
}
