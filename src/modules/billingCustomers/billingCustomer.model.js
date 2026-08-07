import mongoose from "mongoose";

const { Schema, model } = mongoose;

const billingCustomerSchema = new Schema({
    rfc: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        uppercase: true,
    },
    razonSocial: { type: String, required: true, trim: true },
    codigoPostal: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    regimenFiscal: { type: String, required: true, trim: true },
    invoiceUse: { type: String, required: true, trim: true, uppercase: true },
    clientCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        uppercase: true,
    },
}, { timestamps: true });

export const BillingCustomer = model("BillingCustomer", billingCustomerSchema);
