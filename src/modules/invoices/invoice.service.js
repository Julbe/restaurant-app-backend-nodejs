import FacturapiModule from "facturapi";
import { Ticket } from "../tickets/ticket.model.js";
import { Invoice } from "./invoice.model.js";

const FACTURAPI_PRODUCT_KEY = "90101501";
const FACTURAPI_UNIT_KEY = "E48";
const FACTURAPI_UNIT_NAME = "Unidad de servicio";
const FACTURAPI_DESCRIPTION = "Consumo de alimentos.";
const FACTURAPI_SERIES = "R";
const FACTURAPI_TAX_RATE = Number(0.16);
const Facturapi = FacturapiModule.default || FacturapiModule;

const ADMIN_EMAIL = process.env.FACTURAS_ADMIN_EMAIL || 'peter.ajijic@gmail.com';

const TICKET_PAYMENT_FORM_MAP = {
    CASH: "01",
    DEBIT: "28",
    CREDIT: "04",
    OTHER: "99",
    IN_DEBT: "99",
};

const normalizeText = (value = "") => String(value).trim();

const buildError = (message, statusCode = 400, customMessage = message) => {
    console.log(message)
    const error = new Error(message);
    error.statusCode = statusCode;
    error.customMessage = customMessage;
    return error;
};

const sanitizeCustomerInput = (customer = {}) => {
    const payload = {
        taxId: normalizeText(customer.taxId || customer.rfc).toUpperCase(),
        legalName: normalizeText(customer.legalName || customer.razonSocial),
        taxZipCode: normalizeText(customer.taxZipCode || customer.zipCode || customer.codigoPostal),
        taxSystem: normalizeText(customer.taxSystem || customer.regimenFiscal),
        email: normalizeText(customer.email),
    };

    const missingFields = Object.entries(payload)
        .filter(([key, value]) => key !== "email" && !value)
        .map(([key]) => key);

    if (missingFields.length > 0) {
        throw buildError(
            `Faltan campos del cliente: ${missingFields.join(", ")}`,
            400,
            "Datos fiscales incompletos."
        );
    }

    return payload;
};

const normalizeInvoiceInput = (invoice = {}) => {
    const use = normalizeText(invoice.use || invoice.motivo).toUpperCase();

    if (!use) {
        throw buildError("El uso de CFDI es obligatorio.", 400, "Falta el motivo o uso de CFDI.");
    }

    return {
        use,
        sendEmail: Boolean(invoice.sendEmail),
    };
};

const assertFacturapiConfigured = () => {
    if (!process.env.FACTURAPI_SECRET_KEY) {
        throw buildError(
            "FACTURAPI_SECRET_KEY no está configurado.",
            500,
            "Falta configurar la llave de Facturapi en el backend."
        );
    }
};

const getFacturapiClient = () => {
    assertFacturapiConfigured();
    return new Facturapi(process.env.FACTURAPI_SECRET_KEY);
};

const getTicketByCode = async (ticketCode) => {
    const normalizedCode = normalizeText(ticketCode).toUpperCase();
    if (!normalizedCode) {
        throw buildError("ticketCode es obligatorio.", 400, "Debes enviar el código del ticket.");
    }

    const ticket = await Ticket.findOne({ code_ticket: normalizedCode }).lean();
    if (!ticket) {
        throw buildError(`Ticket ${normalizedCode} no encontrado.`, 404, "No encontramos el ticket indicado.");
    }

    if (ticket.status === "CANCELED") {
        throw buildError("El ticket está cancelado.", 409, "No se puede facturar un ticket cancelado.");
    }

    if (ticket.invoiceId) {
        throw buildError(
            "El ticket ya tiene una factura asociada.",
            409,
            "Este ticket ya fue facturado."
        );
    }

    if (typeof ticket.total !== "number" || ticket.total <= 0) {
        throw buildError("El ticket no tiene un total válido.", 409, "El ticket no tiene monto para facturar.");
    }

    return ticket;
};

const mapPaymentForm = (ticketPaymentMethod) => TICKET_PAYMENT_FORM_MAP[ticketPaymentMethod] || "99";

const mapPaymentMethod = (ticketPaymentMethod) => ticketPaymentMethod === "IN_DEBT" ? "PPD" : "PUE";

const buildFacturapiCustomerPayload = (customer) => ({
    legal_name: customer.legalName,
    tax_id: customer.taxId,
    tax_system: customer.taxSystem,
    email: customer.email || undefined,
    address: {
        zip: customer.taxZipCode,
    },
});

const buildFacturapiInvoicePayload = ({ ticket, customer, invoiceInput }) => ({
    customer: buildFacturapiCustomerPayload(customer),
    type: "I",
    currency: "MXN",
    use: invoiceInput.use,
    payment_form: mapPaymentForm(ticket.paymentMethod),
    payment_method: mapPaymentMethod(ticket.paymentMethod),
    series: FACTURAPI_SERIES,
    external_id: ticket.code_ticket,
    idempotency_key: `${ticket.code_ticket}:${customer.taxId}:${invoiceInput.use}`,
    items: [
        {
            quantity: 1,
            product: {
                description: `${FACTURAPI_DESCRIPTION}`,
                product_key: FACTURAPI_PRODUCT_KEY,
                unit_key: FACTURAPI_UNIT_KEY,
                unit_name: FACTURAPI_UNIT_NAME,
                price: ticket.total,
                tax_included: true,
                taxes: [
                    {
                        type: "IVA",
                        rate: FACTURAPI_TAX_RATE,
                    },
                ],
            },
        },
    ],
});

const extractFacturapiError = (error) => {
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Error al consumir el servicio.";

    const providerStatus = error?.response?.status || error?.statusCode;
    const statusCode = providerStatus || 400;

    return buildError(message, statusCode, "Servicio rechazó la solicitud. Motivo: " + message);
};

const createFacturapiCustomer = async (facturapiClient, customerPayload) => {
    try {
        return await facturapiClient.customers.create(customerPayload);
    } catch (error) {
        throw extractFacturapiError(error);
    }
};

const createFacturapiInvoice = async (facturapiClient, invoicePayload) => {
    try {
        return await facturapiClient.invoices.create(invoicePayload);
    } catch (error) {
        throw extractFacturapiError(error);
    }
};

const sendFacturapiInvoiceByEmail = async (facturapiClient, invoiceId, email) => {
    try {
        if (email) {
            return await facturapiClient.invoices.sendByEmail(invoiceId, { email });
        }

        return await facturapiClient.invoices.sendByEmail(invoiceId);
    } catch (error) {
        throw extractFacturapiError(error);
    }
};

const downloadFacturapiInvoiceFile = async (facturapiClient, invoiceId, format) => {
    try {
        if (format === "pdf") {
            return await facturapiClient.invoices.downloadPdf(invoiceId);
        }

        if (format === "xml") {
            return await facturapiClient.invoices.downloadXml(invoiceId);
        }

        if (format === "zip") {
            return await facturapiClient.invoices.downloadZip(invoiceId);
        }

        throw buildError("Formato de descarga no soportado.", 400, "Formato de descarga no soportado.");
    } catch (error) {
        throw extractFacturapiError(error);
    }
};

export class InvoiceService {
    static async processFacturapiInvoice(payload = {}) {
        const customer = sanitizeCustomerInput(payload.customer);
        const invoiceInput = normalizeInvoiceInput(payload.invoice);
        const ticket = await getTicketByCode(payload.ticketCode || payload.code_ticket);
        const facturapiClient = getFacturapiClient();

        const customerPayload = buildFacturapiCustomerPayload(customer);
        const invoicePayload = buildFacturapiInvoicePayload({ ticket, customer, invoiceInput });

        const record = await Invoice.create({
            provider: "FACTURAPI",
            ticketId: ticket._id,
            ticketCode: ticket.code_ticket,
            status: "PREVIEW",
            customer,
            invoice: {
                use: invoiceInput.use,
                paymentForm: invoicePayload.payment_form,
                paymentMethod: invoicePayload.payment_method,
                currency: invoicePayload.currency,
                type: invoicePayload.type,
            },
            ticketSnapshot: {
                total: ticket.total,
                paymentMethod: ticket.paymentMethod || "",
                status: ticket.status || "",
            },
            requestPayload: {
                customer: customerPayload,
                invoice: invoicePayload,
            },
        });

        try {
            const facturapiCustomer = await createFacturapiCustomer(facturapiClient, customerPayload);
            record.responsePayload.customer = facturapiCustomer;
            const facturapiInvoice = await createFacturapiInvoice(facturapiClient, {
                ...invoicePayload,
                customer: facturapiCustomer.id,
            });

            record.status = "ISSUED";
            record.facturapi = {
                customerId: facturapiCustomer.id || "",
                invoiceId: facturapiInvoice.id || "",
                livemode: Boolean(facturapiInvoice.livemode),
            };
            record.responsePayload = {
                customer: facturapiCustomer,
                invoice: facturapiInvoice,
            };
            record.errorMessage = "";

            if (invoiceInput.sendEmail) {
                if (!customer.email) {
                    const emailError = buildError(
                        "No se proporcionó un correo para enviar la factura.",
                        400,
                        "Envía un correo si quieres activar sendEmail."
                    );
                    record.emailDelivery = {
                        sent: false,
                        recipients: [],
                        sentAt: null,
                        lastError: emailError.message,
                    };
                    await record.save();
                    throw emailError;
                }

                try {
                    await sendFacturapiInvoiceByEmail(facturapiClient, facturapiInvoice.id, customer.email);
                    record.emailDelivery = {
                        sent: true,
                        recipients: [customer.email],
                        sentAt: new Date(),
                        lastError: "",
                    };
                } catch (emailError) {
                    record.emailDelivery = {
                        sent: false,
                        recipients: [customer.email],
                        sentAt: null,
                        lastError: emailError.message,
                    };
                    await record.save();
                    throw emailError;
                };
            }

            await sendFacturapiInvoiceByEmail(facturapiClient, facturapiInvoice.id, ADMIN_EMAIL);

            await record.save();
            const ticketUpdateResult = await Ticket.updateOne(
                { _id: ticket._id, invoiceId: null },
                { $set: { invoiceId: record._id } }
            );

            if (ticketUpdateResult.modifiedCount !== 1) {
                throw buildError(
                    "No se pudo vincular la factura al ticket.",
                    409,
                    "El ticket ya fue facturado por otro proceso."
                );
            }

            return {
                ok: true,
                message: "Factura generada correctamente.",
                invoiceRecordId: record._id,
                ticket: {
                    id: ticket._id,
                    code: ticket.code_ticket,
                    total: ticket.total,
                    paymentMethod: ticket.paymentMethod,
                },
                facturapi: {
                    customerId: facturapiCustomer.id,
                    invoiceId: facturapiInvoice.id,
                    livemode: Boolean(facturapiInvoice.livemode),
                    emailSent: Boolean(record.emailDelivery?.sent),
                },
                payload: invoicePayload,
                providerResponse: facturapiInvoice,
            };
        } catch (error) {
            if (!record.facturapi?.invoiceId) {
                record.status = "ERROR";
            }
            record.errorMessage = error.message;
            record.emailDelivery = {
                sent: false,
                recipients: record.emailDelivery?.recipients || [],
                sentAt: record.emailDelivery?.sentAt || null,
                lastError: error.message,
            };
            record.responsePayload = {
                customer: record.responsePayload?.customer || null,
                invoice: {
                    error: error.message,
                },
            };
            await record.save();
            throw error;
        }
    }

    static async sendInvoiceByEmail({ invoiceRecordId, email }) {
        const record = await Invoice.findById(invoiceRecordId);

        if (!record) {
            throw buildError("Factura no encontrada.", 404, "No encontramos el registro de facturación.");
        }

        if (!record.facturapi?.invoiceId) {
            throw buildError(
                "La factura aún no tiene un identificador de Facturapi.",
                409,
                "La factura todavía no fue emitida en Facturapi."
            );
        }

        const recipientEmail = normalizeText(email || record.customer?.email);
        if (!recipientEmail) {
            throw buildError(
                "No se encontró un correo destino.",
                400,
                "Debes enviar un correo o guardar uno en los datos fiscales."
            );
        }

        const facturapiClient = getFacturapiClient();
        await sendFacturapiInvoiceByEmail(facturapiClient, record.facturapi.invoiceId, recipientEmail);

        record.emailDelivery = {
            sent: true,
            recipients: [recipientEmail],
            sentAt: new Date(),
            lastError: "",
        };
        await record.save();

        return {
            ok: true,
            invoiceRecordId: record._id,
            facturapiInvoiceId: record.facturapi.invoiceId,
            recipients: [recipientEmail],
            message: "Factura enviada por correo correctamente.",
        };
    }

    static async downloadInvoiceFile({ invoiceRecordId, format }) {
        const normalizedFormat = normalizeText(format).toLowerCase();
        if (!["pdf", "xml", "zip"].includes(normalizedFormat)) {
            throw buildError(
                "Formato de descarga inválido.",
                400,
                "Solo se permiten pdf, xml o zip."
            );
        }

        const record = await Invoice.findById(invoiceRecordId).lean();
        if (!record) {
            throw buildError("Factura no encontrada.", 404, "No encontramos el registro de facturación.");
        }

        if (!record.facturapi?.invoiceId) {
            throw buildError(
                "La factura aún no tiene un identificador de Facturapi.",
                409,
                "La factura todavía no fue emitida en Facturapi."
            );
        }

        const facturapiClient = getFacturapiClient();
        const file = await downloadFacturapiInvoiceFile(
            facturapiClient,
            record.facturapi.invoiceId,
            normalizedFormat
        );

        return {
            file,
            fileName: `${record.ticketCode || record.facturapi.invoiceId}.${normalizedFormat}`,
            contentType:
                normalizedFormat === "pdf"
                    ? "application/pdf"
                    : normalizedFormat === "xml"
                        ? "application/xml"
                        : "application/zip",
        };
    }
}
