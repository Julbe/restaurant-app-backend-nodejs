
import { catchAsync } from "../../utils/catchAsync.js";
import BaseController from "../baseController.js";
import { Session } from "./session.model.js";

export default class SessionController extends BaseController {

    constructor() {
        super(Session, "Session");
    }
    // Cerrar sesión (desactivar)
    closeSession = catchAsync(async (req, res) => {
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: "Sesión no encontrada" });
        res.json({ message: "Sesión cerrada correctamente", session });
    }, "No se pudo cerrar la sesión");
}

