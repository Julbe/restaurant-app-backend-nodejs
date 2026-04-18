import mongoose from "mongoose";
const { Schema, model } = mongoose;

const employeeSchema = new Schema(
{
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gener: { type: String, enum: ["F", "M", "Other", "Not say"]},
    
    rfc: { type: String, required: true, unique: true, uppercase: true },
    curp: { type: String, required: true, unique: true, uppercase: true },
    nss: { type: String, required: true, unique: true },
    
    position: { type: String, required: true }, // ej. "Cocinero", "Mesero"
    salary: { type: Number, required: true }, 
    hireDate: { type: Date, required: true },
    workSchedule: {
        startTime: { type: String, required: true }, // ej. "10:00"
        endTime: { type: String, required: true },   // ej. "18:00"
        days: [{ type: String, enum: ["Lunes", "Martes", "Jueves", "Viernes", "Sábado", "Domingo"] }],
    },
    activitiesDescription: {type: String},
    vacationDays: { type: Number, default: 6 },
    usedVacationDays: { type: Number, default: 0 },
    active: { type: Boolean, default: true },

    birthDate: { type: Date },
    birthPlace: { type: String},
    maritalStatus: {
        type: String,
        enum: ["Soltero", "Casado", "Divorciado", "Viudo", "Unión libre", "Otro"],
    },
    address: {
        street: String,
        number: String,
        neighborhood: String,
        city: String,
        state: String,
        postalCode: String,
    },
    contact: {
        phone: { type: String },
        email: { type: String, lowercase: true, trim: true },
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String,
        },
    },
    allergics: { type: String},
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    } , { timestamps: true, }
);

export const Employee = model("Employee", employeeSchema);
