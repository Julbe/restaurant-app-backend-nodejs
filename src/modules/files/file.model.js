import mongoose from "mongoose";
const { Schema, model } = mongoose;

var fileSchema = new Schema({
    name: String,
    key: String,
    originalName: String,
    mimeType: String,
}, { timestamps: true });

export const FileS3 = model("FileS3", fileSchema);
