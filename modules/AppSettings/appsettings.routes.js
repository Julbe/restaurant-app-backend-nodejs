import { Router } from "express";
import { getFile, putJson } from "../../services/s3.service.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { requirePrivilege } from "../../middlewares/requirePrivilege.js";
import { PRIVILEGES } from "../../config/privileges.js";

const router = Router();

function isPlainObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
}

router.get("/", async (req, res) => {
    try {
        const key =
            req.query.key ||
            process.env.SETTINGS_KEY ||
            "settings/f-JEM52.json";

        const file = await getFile(key, { parseJson: true });

        return res.json({
            success: true,
            data: file.body,
        });
    } catch (err) {
        console.error("GET /api/settings error:", err);
        return res.status(500).json({
            success: false,
            message: err?.message ?? "Unknown error",
        });
    }
});

router.patch("/", verifyToken, requirePrivilege(PRIVILEGES.SETTINGS
), async (req, res) => {
    try {
        const key =
            req.query.key ||
            process.env.SETTINGS_KEY ||
            "settings/f-JEM52.json";

        if (!isPlainObject(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Body must be a JSON object",
            });
        }

        const current = await getFile(key, { parseJson: true });
        const currentSettings = current.body;

        const updated = { ...currentSettings, ...req.body };

        await putJson(key, updated);

        return res.json({
            success: true,
            data: updated,
        });
    } catch (err) {
        console.error("PATCH /appsettings error:", err);
        return res.status(500).json({
            success: false,
            message: err?.message ?? "Unknown error",
        });
    }
});

export default router;
