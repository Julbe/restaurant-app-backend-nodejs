import mongoose from "mongoose";
const { Schema } = mongoose;


const dishSelectionOptionSchema = new Schema(
    {
        label: { type: String, default: "" },
        dishId: { type: Schema.Types.ObjectId, ref: "Dish", default: null },
        productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
        sideId: { type: Schema.Types.ObjectId, ref: "Side", default: null },
        extraPrice: { type: Number, default: 0 },
        isDefault: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
    },
    { _id: false }
);

const dishSelectionGroupSchema = new Schema(
    {
        key: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        minSelect: { type: Number, default: 0, min: 0 },
        maxSelect: { type: Number, default: 1, min: 0 },
        multiple: { type: Boolean, default: false },
        optionType: {
            type: String,
            enum: ["dish", "product", "side", "mixed"],
            default: "dish",
        },
        options: [dishSelectionOptionSchema],
    },
    { _id: false }
);

const dishSchema = new Schema(
    {
        name: { type: String, required: true },
        detail: { type: String, required: true },
        s3Key: { type: String, trim: true, default: "" },
        price: { type: Number, required: true },
        areaMenu_id: { type: Schema.Types.ObjectId, ref: "AreaMenu", default: null, index: true },
        configurationMode: {
            type: String,
            enum: ["fixed", "selectable"],
            default: "fixed",
        },
        productIds: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: "Product",
            }],
            default: [],
        },
        productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
        selectionGroups: [dishSelectionGroupSchema],
        modifiers: [{ type: Schema.Types.ObjectId, ref: "Modifier" }],
        sides: {
            items: [{ type: Schema.Types.ObjectId, ref: "Side" }],
            minSelect: { type: Number, default: 0 },
            maxSelect: { type: Number, default: 2 },
        },
        available: { type: Boolean, default: true }
    },
    { timestamps: true }
);

dishSchema.index({ name: 1, configurationMode: 1, available: 1 });

export const Dish = mongoose.model("Dish", dishSchema);
