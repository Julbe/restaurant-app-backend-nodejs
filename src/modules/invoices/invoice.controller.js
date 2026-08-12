import { Invoice } from "./invoice.model.js";
import { InvoiceService } from "./invoice.service.js";

const buildError = (message, statusCode = 400, customMessage = message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.customMessage = customMessage;
    return error;
};

const sendDownloadResponse = async (res, { file, fileName, contentType }) => {
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);

    if (file && typeof file.pipe === "function") {
        file.pipe(res);
        return;
    }

    if (file && typeof file.arrayBuffer === "function") {
        const arrayBuffer = await file.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
        return;
    }

    if (file && typeof file.getReader === "function") {
        const chunks = [];
        const reader = file.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(Buffer.from(value));
        }

        res.end(Buffer.concat(chunks));
        return;
    }

    if (Buffer.isBuffer(file)) {
        res.end(file);
        return;
    }

    throw buildError(
        "No se pudo procesar el archivo descargado.",
        500,
        "Servicio devolvió un formato de archivo no soportado."
    );
};

export default class InvoiceController {
    processFacturapi = async (req, res, next) => {
        try {
            if (req.body?.ticketCodes !== undefined) {
                const result = await InvoiceService.processFacturapiInvoices(req.body);
                return res.status(result.ok ? 201 : 207).json(result);
            }

            const result = await InvoiceService.processFacturapiInvoice(req.body);
            return res.status(201).json(result);
        } catch (error) {
            return next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const invoice = await Invoice.findById(req.params.id)
                .populate("ticketId")
                .lean();

            if (!invoice) {
                throw buildError("Factura no encontrada.", 404, "No encontramos el registro de facturación.");
            }

            return res.json({ data: invoice });
        } catch (error) {
            return next(error);
        }
    };

    sendByEmail = async (req, res, next) => {
        try {
            const result = await InvoiceService.sendInvoiceByEmail({
                invoiceRecordId: req.params.id,
                email: req.body?.email,
            });

            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    };

    downloadFile = async (req, res, next) => {
        try {
            const result = await InvoiceService.downloadInvoiceFile({
                invoiceRecordId: req.params.id,
                format: req.params.format,
            });

            await sendDownloadResponse(res, result);
        } catch (error) {
            return next(error);
        }
    };
}
