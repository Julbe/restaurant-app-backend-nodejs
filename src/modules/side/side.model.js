import mongoose from "mongoose";
const { Schema, model } = mongoose;


const sideSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    available: { type: Boolean, default: true },
    value: { type: Number, default: 1 },
    extraPrice: { type: Number, default: 0 },
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null, index: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

sideSchema.index({ name: 1, available: 1 });

export const Side = model("Side", sideSchema);
