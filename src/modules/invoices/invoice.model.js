import mongoose from "mongoose";

const { Schema, model } = mongoose;

const invoiceSchema = new Schema({
    provider: {
        type: String,
        enum: ["FACTURAPI"],
        default: "FACTURAPI",
        index: true,
    },
    ticketId: {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        index: true,
    },
    ticketCode: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["PREVIEW", "ISSUED", "ERROR"],
        default: "PREVIEW",
        index: true,
    },
    customer: {
        taxId: { type: String, required: true, trim: true },
        legalName: { type: String, required: true, trim: true },
        taxZipCode: { type: String, required: true, trim: true },
        taxSystem: { type: String, required: true, trim: true },
        email: { type: String, default: "", trim: true },
    },
    invoice: {
        use: { type: String, required: true, trim: true },
        paymentForm: { type: String, required: true, trim: true },
        paymentMethod: { type: String, required: true, trim: true },
        currency: { type: String, default: "MXN", trim: true },
        type: { type: String, default: "I", trim: true },
    },
    ticketSnapshot: {
        total: { type: Number, required: true },
        paymentMethod: { type: String, default: "" },
        status: { type: String, default: "" },
    },
    facturapi: {
        customerId: { type: String, default: "", trim: true },
        invoiceId: { type: String, default: "", trim: true },
        livemode: { type: Boolean, default: false },
    },
    emailDelivery: {
        sent: { type: Boolean, default: false },
        recipients: [{ type: String, trim: true }],
        sentAt: { type: Date, default: null },
        lastError: { type: String, default: "" },
    },
    requestPayload: {
        customer: { type: Schema.Types.Mixed, default: null },
        invoice: { type: Schema.Types.Mixed, default: null },
    },
    responsePayload: {
        customer: { type: Schema.Types.Mixed, default: null },
        invoice: { type: Schema.Types.Mixed, default: null },
    },
    errorMessage: { type: String, default: "" },
}, { timestamps: true });

invoiceSchema.index({ provider: 1, ticketCode: 1, createdAt: -1 });

export const Invoice = model("Invoice", invoiceSchema);
