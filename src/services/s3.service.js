// const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { generateCode } = require("../libraries/generateCodes");

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { generateCode } from "../utils/generateCodes.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const PUBLIC_PREFIX = "public/";
const PUBLIC_BASE_URL =
    process.env.BUCKET_URL || "https://app-restaurant-assets.s3.us-east-1.amazonaws.com/";

const BUCKET_TYPE = {
    private: process.env.BUCKET_NAME
}


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_KEY
    },
    region: process.env.BUCKET_REGION
});

/** Helpers **/
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
}

/**
 * Sube cualquier archivo a S3
 * @param {Buffer} buffer 
 * @param {string} mimetype 
 * @param {string} folder - carpeta dentro del bucket (img, pdf, docs)
 * @param {string} filename - nombre legible opcional
 * @returns {string} Key del archivo en S3
 */
async function uploadFile(buffer, mimetype, s3Key = "", folder = "misc", filename = "", bucket = BUCKET_TYPE.private) {
    const safeName = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, "") : "";
    const Key = (s3Key != undefined && s3Key != "") ? s3Key : `${folder}/${generateCode('f')}-${safeName}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key,
        Body: buffer,
        ContentType: mimetype
    }));

    return Key;
}

async function deleteFile(Key, bucket = BUCKET_TYPE.private) {
    await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key
    }));
}

async function getUrl(Key, bucket = BUCKET_TYPE.private, expiresIn = 3600) {


    if (Key.startsWith(PUBLIC_PREFIX)) {
        return `${PUBLIC_BASE_URL}${encodeURIComponent(Key).replace(/%2F/g, "/")}`;
    }


    return getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucket,
            Key
        }),
        { expiresIn }
    );
}

/**
 * Obtiene un archivo de S3 y lo devuelve como string o JSON (si parseJson=true)
 * @param {string} Key
 * @param {{ parseJson?: boolean }} options
 * @returns {Promise<{ key: string, contentType?: string, body: string | any }>}
 */
async function getFile(Key, options = {}, bucket = BUCKET_TYPE.private) {
    const { parseJson = false } = options;

    const result = await s3.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key,
        })
    );

    if (!result?.Body) {
        throw new Error("S3 returned empty body");
    }

    const text = await streamToString(result.Body);

    if (parseJson) {
        try {
            return {
                key: Key,
                contentType: result.ContentType,
                body: JSON.parse(text),
            };
        } catch (e) {
            throw new Error("File is not valid JSON");
        }
    }

    return {
        key: Key,
        contentType: result.ContentType,
        body: text,
    };
}


async function putJson(Key, obj, bucket = BUCKET_TYPE.private) {
    const body = JSON.stringify(obj, null, 2);

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key,
            Body: body,
            ContentType: "application/json; charset=utf-8",
            CacheControl: "no-store",
        })
    );

    return Key;
}


export { uploadFile, getUrl, deleteFile, getFile, putJson, BUCKET_TYPE };
