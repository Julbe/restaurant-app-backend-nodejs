import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: {
        type: String,
        enum: ["NEW", "IN_PROGRESS", "DONE", "MISSING_INFORMATION", "CANCELED"],
        default: "NEW",
        index: true,
    },
    dishes: [{
        type: Schema.Types.ObjectId,
        ref: "Dish",
    }],
    notes: { type: String, default: "" },
}, { timestamps: true });

orderSchema.index({ createdBy: 1, status: 1, createdAt: -1 });

export const Order = model("Order", orderSchema);
