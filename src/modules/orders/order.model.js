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

const orderGroupSelectionOptionSchema = new Schema({
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", default: null },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    extraPrice: { type: Number, default: 0, min: 0 },
}, { _id: false });

const orderSelectedGroupSchema = new Schema({
    groupKey: { type: String, required: true, trim: true },
    groupName: { type: String, required: true, trim: true },
    minSelect: { type: Number, default: 0, min: 0 },
    maxSelect: { type: Number, default: 0, min: 0 },
    multiple: { type: Boolean, default: false },
    options: { type: [orderGroupSelectionOptionSchema], default: [] },
}, { _id: false });

const orderItemSchema = new Schema({
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true, trim: true },
    basePrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    notes: { type: String, default: "" },
    selectedModifiers: { type: [orderSelectedModifierSchema], default: [] },
    selectedGroups: { type: [orderSelectedGroupSchema], default: [] },
    extraTotal: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, default: 0, min: 0 },
}, { _id: false });

const orderSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    serviceType: {
        type: String,
        enum: ["takeOut", "here"],
        default: "here",
        index: true,
    },
    orderDateKey: { type: String, required: true, index: true },
    orderNumber: { type: Number, required: true, min: 1 },
    code_order: { type: String, required: true, trim: true, index: true },
    status: {
        type: String,
        enum: ["NEW", "IN_PROGRESS", "DONE", "MISSING_INFORMATION", "CANCELED"],
        default: "NEW",
        index: true,
    },
    sourceOrderCode: { type: String, default: "" },
    items: { type: [orderItemSchema], default: [] },
    notes: { type: String, default: "" },
}, { timestamps: true });

orderSchema.index({ ticketId: 1, status: 1, createdAt: -1 });
orderSchema.index({ ticketId: 1, serviceType: 1, status: 1, createdAt: -1 });
orderSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
orderSchema.index({ orderDateKey: 1, orderNumber: 1 }, { unique: true });

export const Order = model("Order", orderSchema);
