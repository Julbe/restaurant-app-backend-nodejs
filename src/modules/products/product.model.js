import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productUsageSchema = new Schema(
    {
        asDish: { type: Boolean, default: false },
        asSide: { type: Boolean, default: false },
        asIngredient: { type: Boolean, default: false },
        asFlavorOption: { type: Boolean, default: false },
    },
    { _id: false }
);

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        description: { type: String, default: "" },
        s3Key: { type: String, trim: true, default: "" },
        available: { type: Boolean, default: true, index: true },
        usage: { type: productUsageSchema, default: () => ({}) },
        modifiers: [{ type: Schema.Types.ObjectId, ref: "Modifier" }],
        sortOrder: { type: Number, default: 0, index: true },
    },
    { timestamps: true }
);

productSchema.index({ name: 1, available: 1 });

export const Product = model("Product", productSchema);
