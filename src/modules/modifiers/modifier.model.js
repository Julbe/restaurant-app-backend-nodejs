import mongoose from "mongoose";
const { Schema, model } = mongoose;


const modifierOptionSchema = new Schema({
    name: { type: String, required: true }, // ej. "Sin picante"
    price: { type: Number, default: 0 },    // ej. +10 por extra queso
}, { _id: false });

const modifierSchema = new Schema({
    name: { type: String, required: true }, // ej. "Nivel de picante"
    required: { type: Boolean, default: false }, // si es obligatorio
    multiple: { type: Boolean, default: false }, // si se pueden elegir varias
    default: { type: String, required: true },
    options: [modifierOptionSchema],
    scope: {
        type: String,
        enum: ["product", "dish", "global"],
        default: "product",
    },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

modifierSchema.index({ name: 1, scope: 1 });

export const Modifier = model("Modifier", modifierSchema);
