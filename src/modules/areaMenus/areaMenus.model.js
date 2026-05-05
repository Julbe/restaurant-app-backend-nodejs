import mongoose from "mongoose";

const { Schema, model } = mongoose;

const areaMenuSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80, index: true },
        isVisible: { type: Boolean, default: true, index: true },
        sortOrder: { type: Number, default: 0, index: true },
    },
    { timestamps: true }
);

areaMenuSchema.index({ sortOrder: 1, name: 1 });

export const AreaMenu = model("AreaMenu", areaMenuSchema);
