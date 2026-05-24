import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ticketSchema = new Schema({
    waiterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tableId: {
        type: Schema.Types.ObjectId,
        ref: "Table",
        default: null,
        index: true,
    },
    peopleCount: { type: Number, default: 1, min: 1 },
    code_ticket: { type: String, trim: true, sparse: true },
    status: {
        type: String,
        enum: ["OPEN", "CLOSE", "PENDING_PAYMENT", "CANCELED"],
        default: "OPEN",
        index: true,
    },
    notes: { type: String, default: "" },
    total: { type: Number, default: 0, min: 0 },
    paymentMethod: {
        type: String,
        enum: ["CASH", "DEBIT", "CREDIT", "OTHER", "IN_DEBT"],
        default: null,
    },
    paymentDetails: { type: String, default: "" },
    discount: { type: Number, default: 0, min: 0 },
    tips: { type: Number, default: 0, min: 0 },
    client_name: { type: String, default: "", trim: true },
}, { timestamps: true });

ticketSchema.index({ waiterId: 1, tableId: 1, status: 1, createdAt: -1 });

export const Ticket = model("Ticket", ticketSchema);
