import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

const CHANGELOG_PATH = path.join(projectRoot, "CHANGELOG.md");
const PACKAGE_JSON_PATH = path.join(projectRoot, "package.json");

const getPackageVersion = () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
        return packageJson.version ?? "0.0.0";
    } catch {
        return "0.0.0";
    }
};

export const getLatestReleaseInfo = () => {
    const fallback = {
        version: getPackageVersion(),
        releaseDate: null,
        message: "",
    };

    try {
        const changelog = fs.readFileSync(CHANGELOG_PATH, "utf8");
        const [latestBlock = ""] = changelog.split(/\n(?=# )/);
        const headerMatch = latestBlock.match(/^#\s+\[?([^\]\s]+)\]?(?:\([^)]+\))?\s+\((\d{4}-\d{2}-\d{2})\)/m);
        const message = latestBlock
            .split("\n")
            .slice(2)
            .map((line) => line.trim())
            .filter(Boolean)
            .join("\n");

        return {
            version: headerMatch?.[1] ?? fallback.version,
            releaseDate: headerMatch?.[2] ?? fallback.releaseDate,
            message: message || fallback.message,
        };
    } catch {
        return fallback;
    }
};
