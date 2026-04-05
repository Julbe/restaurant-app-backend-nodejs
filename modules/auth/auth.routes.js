import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserM } from "../user/user.model.js";
import { Session } from "../session/session.model.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;

    const userO = await UserM.findOne({ user }).populate('roleId');
    if (!userO) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, userO.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    const roleName = userO.roleId.name ?? 'NO_VALID';
    const privileges = userO.roleId.privileges ?? {};

    const filteredPrivileges = Object.fromEntries(
      Object.entries(privileges).filter(([_, value]) => value === true)
    );
    // Crear token JWT
    const token = jwt.sign({
      id: userO._id,
      user: userO.user,
      defaultPassword: userO.defaultPassword,
      role: roleName,
      privileges: filteredPrivileges,
    }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const activeSession = await Session.findOne({
      userId: userO._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    if (activeSession) {
      activeSession.token = token;
      activeSession.expiresAt = expiresAt;

      await activeSession.save();

      return res.json({
        message: "Sesión ya activa, renovando token",
        token: activeSession.token,
        sessionId: activeSession._id ?? ''
      });
    }

    const newSession = await Session.create({
      userId: userO._id,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "Login exitoso", token, sessionId: newSession._id ?? '' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body ?? {};

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const user = await UserM.findById(userId).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Contraseña actual incorrecta" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.json({ success: true, data: { message: "Contraseña actualizada" } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
