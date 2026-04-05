
import { deleteFile, getUrl, uploadFile } from "../../services/s3.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { generateUniqueCode } from "../../utils/generateCodes.js";
import BaseController from "../baseController.js";
import { FileS3 } from "./file.model.js";
import path from 'path';

export default class FileController extends BaseController {
    constructor() {
        super(FileS3, "Archivo S3", ["name", "key"]);
    }

    async beforeCreate(req) {
        const { file, body } = req;
        if (!file) throw new Error("No se recibió archivo");

        const folder = body.folder ?? "assets";

        const key = await generateUniqueCode(FileS3, 'f');
        const extension = path.extname(file.originalname);


        const Key = await uploadFile(
            file.buffer,
            file.mimetype,
            `${folder}/${key}${extension}`,
            folder,
            file.originalname
        );

        return {
            name: body.name ?? file.originalname,
            key: Key,
            mimeType: file.mimetype,
            originalName: file.originalname
        };
    }

    async beforeUpdate(req) {
        const { file, body, params } = req;
        if (!file) return body;
        const folder = body.folder ?? "assets";

        const doc = await FileS3.findById(params.id);
        if (!doc) throw new Error("Archivo no encontrado");

        const newKey = await uploadFile(
            file.buffer,
            file.mimetype,
            doc.key,
            folder,
            file.originalname
        );
        return {
            ...body,
            key: newKey,
            mimeType: file.mimetype,
            originalName: file.originalname
        };
    }

    async afterGetAll(docs) {
        const data = await Promise.all(
            docs.data.map(async (f) => {
                const url = await getUrl(f.key);
                return { ...f, url };
            })
        );
        return { ...docs, data };
    }

    async afterGetById(f) {
        console.log(f);
        const url = await getUrl(f.key);

        return { ...f, url };
    }

    getUrlFromKey = catchAsync(async (req, res) => {
        const key = req.body.key;
        const url = await getUrl(key);
        res.json({ url });
    }, () => ([`No se pudo consultar.`, `Controllador: ${this.modelName}`]));

    async beforeDelete(req, doc) {
        if (doc?.key) {
            await deleteFile(doc.key);
        }
    }
}
