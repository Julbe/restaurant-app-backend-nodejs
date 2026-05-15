import jwt from "jsonwebtoken";
import { Session } from "../modules/session/session.model.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token inválido" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await Session.findOneAndUpdate(
      {
        token,
        isActive: true,
        expiresAt: { $gt: new Date() },
      },
      {
        lastActivityAt: new Date(),
      }
    );
    if (!session) {
      return res.status(401).json({ message: "Sesión revocada o expirada" });
    }
    res.locals.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
