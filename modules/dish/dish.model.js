import mongoose from "mongoose";
const { Schema } = mongoose;

const dishSchema = new Schema({
    name: { type: String, required: true },
    detail: { type: String, required: true },
    price: { type: Number, required: true },
    modifiers: [{ type: Schema.Types.ObjectId, ref: "Modifier" }],
    sides: {
        items: [{ type: Schema.Types.ObjectId, ref: "Side" }],
        minSelect: { type: Number, default: 0 },
        maxSelect: { type: Number, default: 2 },
    },
    available: { type: Boolean, default: true }
});

export const Dish = mongoose.model("Dish", dishSchema);
