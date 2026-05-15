import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserM } from "../user/user.model.js";
import { Session } from "../session/session.model.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();
const ACCESS_TOKEN_EXPIRATION = "1h";
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_EXPIRATION = "7d";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INACTIVITY_LIMIT_MS = Number(process.env.SESSION_INACTIVITY_LIMIT_MS || 30 * 60 * 1000);

const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const buildUserPayload = (user) => {
  const roleName = user.roleId.name ?? "NO_VALID";
  const privileges = user.roleId.privileges ?? {};

  const filteredPrivileges = Object.fromEntries(
    Object.entries(privileges).filter(([_, value]) => value === true)
  );

  return {
    id: user._id,
    user: user.user,
    defaultPassword: user.defaultPassword,
    role: roleName,
    privileges: filteredPrivileges,
  };
};

const createAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: ACCESS_TOKEN_EXPIRATION,
});

const createRefreshToken = (payload, sessionId) => jwt.sign(
  {
    id: payload.id,
    sessionId,
    type: "refresh",
  },
  getRefreshSecret(),
  { expiresIn: REFRESH_TOKEN_EXPIRATION }
);

// Login
router.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;

    const userO = await UserM.findOne({ user }).populate('roleId');
    if (!userO) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, userO.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    const payload = buildUserPayload(userO);
    const token = createAccessToken(payload);

    const activeSession = await Session.findOne({
      userId: userO._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    if (activeSession) {
      const refreshToken = createRefreshToken(payload, activeSession._id.toString());

      activeSession.token = token;
      activeSession.refreshToken = refreshToken;
      activeSession.expiresAt = expiresAt;
      activeSession.refreshExpiresAt = refreshExpiresAt;
      activeSession.lastActivityAt = new Date();
      activeSession.isActive = true;

      await activeSession.save();

      return res.json({
        message: "Sesión ya activa, renovando token",
        token: activeSession.token,
        refreshToken: activeSession.refreshToken,
        sessionId: activeSession._id ?? ''
      });
    }

    const newSession = new Session({
      userId: userO._id,
      token,
      expiresAt,
      refreshExpiresAt,
      lastActivityAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    newSession.refreshToken = createRefreshToken(payload, newSession._id.toString());

    await newSession.save();

    res.json({
      message: "Login exitoso",
      token,
      refreshToken: newSession.refreshToken,
      sessionId: newSession._id ?? '',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken, sessionId } = req.body ?? {};

    if (!refreshToken || !sessionId) {
      return res.status(400).json({ message: "refreshToken y sessionId son requeridos" });
    }

    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(refreshToken, getRefreshSecret());
    } catch {
      return res.status(401).json({ message: "Refresh token inválido o expirado" });
    }

    if (decodedRefreshToken.type !== "refresh" || decodedRefreshToken.sessionId !== sessionId) {
      return res.status(401).json({ message: "Refresh token inválido" });
    }

    const session = await Session.findOne({
      _id: sessionId,
      isActive: true,
      refreshToken,
      refreshExpiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ message: "Sesión inválida o expirada" });
    }

    const inactiveTooLong =
      !session.lastActivityAt ||
      Date.now() - new Date(session.lastActivityAt).getTime() > INACTIVITY_LIMIT_MS;

    if (inactiveTooLong) {
      session.isActive = false;
      await session.save();
      return res.status(401).json({ message: "Sesión expirada por inactividad" });
    }

    const userO = await UserM.findById(session.userId).populate("roleId");
    if (!userO) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const payload = buildUserPayload(userO);
    const token = createAccessToken(payload);
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    session.token = token;
    session.expiresAt = expiresAt;

    await session.save();

    return res.json({
      message: "Token renovado correctamente",
      token,
      refreshToken: session.refreshToken,
      sessionId: session._id ?? "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const userId = res.locals.user?.id;
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
