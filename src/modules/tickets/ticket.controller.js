import { generateCode } from "../../utils/generateCodes.js";
import BaseController from "../baseController.js";
import { Ticket } from "./ticket.model.js";

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
            ["code_ticket", "client_name", "notes"],
            [
                "waiterId",
                "tableId",
                {
                    path: "orders",
                    populate: [
                        { path: "createdBy" },
                        { path: "dishes" },
                    ],
                },
            ],
            [
                "waiterId",
                "tableId",
                {
                    path: "orders",
                    populate: [
                        { path: "createdBy" },
                        { path: "dishes" },
                    ],
                },
            ]
        );
    }

    async afterCreate(item) {
        const weekNumber = String(getWeekNumber()).padStart(2, "0");
        let code_ticket = item.code_ticket;
        let exists = true;

        while (exists) {
            code_ticket = `${generateCode('T', 4)}-${weekNumber}`;
            exists = await Ticket.exists({ code_ticket, _id: { $ne: item._id } });
        }

        item.code_ticket = code_ticket;
        await item.save();

        return item;
    }
}
