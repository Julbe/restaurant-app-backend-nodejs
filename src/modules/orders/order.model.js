import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderModifierOptionSchema = new Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
}, { _id: false });

const orderSelectedModifierSchema = new Schema({
    modifierId: { type: Schema.Types.ObjectId, ref: "Modifier", default: null },
    name: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    options: { type: [orderModifierOptionSchema], default: [] },
}, { _id: false });

const orderItemSchema = new Schema({
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true, trim: true },
    basePrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    notes: { type: String, default: "" },
    selectedModifiers: { type: [orderSelectedModifierSchema], default: [] },
    extraTotal: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, default: 0, min: 0 },
}, { _id: false });

const orderSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    orderDateKey: { type: String, required: true, index: true },
    orderNumber: { type: Number, required: true, min: 1 },
    code_order: { type: String, required: true, trim: true, index: true },
    status: {
        type: String,
        enum: ["NEW", "IN_PROGRESS", "DONE", "MISSING_INFORMATION", "CANCELED"],
        default: "NEW",
        index: true,
    },
    items: { type: [orderItemSchema], default: [] },
    notes: { type: String, default: "" },
}, { timestamps: true });

orderSchema.index({ ticketId: 1, status: 1, createdAt: -1 });
orderSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
orderSchema.index({ orderDateKey: 1, orderNumber: 1 }, { unique: true });

export const Order = model("Order", orderSchema);
