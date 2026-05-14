import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ticketSchema = new Schema({
    waiterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: "Table", required: true, index: true },
    code_ticket: { type: String, trim: true, unique: true, sparse: true },
    status: {
        type: String,
        enum: ["OPEN", "CLOSE", "PENDING_PAYMENT", "CANCELED"],
        default: "OPEN",
        index: true,
    },
    notes: { type: String, default: "" },
    total: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tips: { type: Number, default: 0, min: 0 },
    client_name: { type: String, default: "", trim: true },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: "Order",
    }],
}, { timestamps: true });

ticketSchema.index({ waiterId: 1, tableId: 1, status: 1, createdAt: -1 });

export const Ticket = model("Ticket", ticketSchema);
