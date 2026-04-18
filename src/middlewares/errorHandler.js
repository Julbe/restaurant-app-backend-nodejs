export const errorHandler = (err, req, res, next) => {
    console.error("Error atrapado:", err);

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: "Error de validación",
            details: messages,
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.customMessage || err.message || "Error interno del servidor",
    });
  };