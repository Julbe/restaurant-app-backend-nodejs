import { generateCode } from "../../utils/generateCodes.js";
import BaseController from "../baseController.js";
import { Order } from "../orders/order.model.js";
import { Ticket } from "./ticket.model.js";

const SERVICE_TYPES = ["takeOut", "here"];

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeTableId = (value) => {
    if (value === "" || value === undefined) {
        return null;
    }

    return value;
};

const normalizeTicketPayload = (payload = {}, currentTicket = null) => {
    const data = { ...payload };
    const serviceType = data.serviceType ?? currentTicket?.serviceType ?? "here";

    if (!SERVICE_TYPES.includes(serviceType)) {
        throw createHttpError("serviceType inválido. Usa 'takeOut' o 'here'.", 400);
    }

    data.serviceType = serviceType;

    if (serviceType === "takeOut") {
        data.tableId = null;
        return data;
    }

    if (hasOwn(data, "tableId")) {
        data.tableId = normalizeTableId(data.tableId);
        return data;
    }

    if (!currentTicket) {
        data.tableId = null;
    }

    return data;
};

const getWeekNumber = (date = new Date()) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
};

export default class TicketController extends BaseController {
    constructor() {
        super(
            Ticket,
            "Ticket",
            ["code_ticket", "client_name", "notes", "serviceType"],
            [
                "waiterId",
                "tableId"
            ],
            [
                "waiterId",
                "tableId"
            ],
            [],
            { "waiterId": "user" }
        );
    }

    async beforeCreate(req) {
        let payload = normalizeTicketPayload(req.body);
        const weekNumber = String(getWeekNumber()).padStart(2, "0");
        let code_ticket = payload.code_ticket;
        let exists = true;

        while (exists) {
            code_ticket = `${generateCode('T', 4)}-${weekNumber}`;
            exists = await Ticket.exists({ code_ticket });
        }

        payload.code_ticket = code_ticket;
        return payload;
    }

    async beforeUpdate(req) {
        const currentTicket = await Ticket.findById(req.params.id).select("serviceType tableId");
        if (!currentTicket) {
            throw createHttpError("No encontrado", 404);
        }

        const data = normalizeTicketPayload(req.body, currentTicket);
        delete data.code_ticket;

        return data;
    }

    cancelTicket = async (req, res) => {
        try {
            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) {
                return res.status(404).json({ message: "No encontrado" });
            }

            await Order.updateMany(
                {
                    ticketId: ticket._id,
                    status: "NEW",
                },
                {
                    $set: { status: "CANCELED" },
                }
            );

            ticket.status = "CANCELED";
            await ticket.save();

            return res.json(ticket);
        } catch (error) {
            const statusCode = error?.statusCode || 500;
            return res.status(statusCode).json({
                message: error?.message || "No se pudo cancelar el ticket.",
            });
        }
    };
}
