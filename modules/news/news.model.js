import mongoose from "mongoose";

const { Schema } = mongoose;

const CtaSchema = new Schema(
    {
        label: { type: String, trim: true, maxlength: 40 }, // "Reservar", "Ver más"
        url: { type: String, trim: true, maxlength: 2048 },
        kind: {
            type: String,
            enum: ["external", "internal"],
            default: "external",
        },
    },
    { _id: false }
);


const NewsSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        // Contenido
        title: { type: String, required: true, trim: true, maxlength: 80 },
        subtitle: { type: String, trim: true, maxlength: 120 },
        excerpt: { type: String, trim: true, maxlength: 220 }, // para cards
        body: { type: String, trim: true, maxlength: 5000 },   // texto largo (si lo usas)
        // Medios
        s3Key: { type: String, default: null },
        // Call to action
        cta: { type: CtaSchema, default: null },
        // Programación
        publishAt: { type: Date, default: null, index: true },
        expireAt: { type: Date, default: null, index: true },
        // Presentación / orden
        pinned: { type: Boolean, default: false, index: true },
        priority: { type: Number, default: 0, index: true }, // mayor = más arriba
        sortOrder: { type: Number, default: 0, index: true }, // si quieres orden manual
        // Meta
        tags: [{ type: String, trim: true, lowercase: true, maxlength: 24 }],

        // Auditoría (opcional)
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
        // Métricas (opcional)
        metrics: {
            views: { type: Number, default: 0 },
            clicks: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

/**
 * Índice útil para listar noticias visibles:
 * - published
 * - isActive
 * - dentro de ventana de tiempo publishAt/expireAt
 */
NewsSchema.index({
    status: 1,
    isActive: 1,
    pinned: -1,
    priority: -1,
    sortOrder: -1,
    publishAt: -1,
    createdAt: -1,
});

// Normalización automática: si publicas sin publishAt, se setea a "ahora"
NewsSchema.pre("save", function (next) {
    if (this.status === "published" && !this.publishAt) {
        this.publishAt = new Date();
    }
    next();
});

// Helper: noticia visible “ahora”
NewsSchema.statics.findVisible = function ({ restaurantId } = {}) {
    const now = new Date();
    const q = {
        status: "published",
        isActive: true,
        $and: [
            { $or: [{ publishAt: null }, { publishAt: { $lte: now } }] },
            { $or: [{ expireAt: null }, { expireAt: { $gt: now } }] },
        ],
    };
    if (restaurantId) q.restaurantId = restaurantId;
    return this.find(q).sort({ pinned: -1, priority: -1, sortOrder: -1, publishAt: -1, createdAt: -1 });
};

export const News = mongoose.model("News", NewsSchema);
