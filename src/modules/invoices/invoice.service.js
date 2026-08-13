import FacturapiModule from "facturapi";
import { Ticket } from "../tickets/ticket.model.js";
import { BillingCustomer } from "../billingCustomers/billingCustomer.model.js";
import { Invoice } from "./invoice.model.js";
import { generateUniqueCode } from "../../utils/generateCodes.js";

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

const normalizeEmailRecipients = (value = "") => [...new Set(
    (Array.isArray(value) ? value : [value])
        .flatMap((email) => String(email || "").split(","))
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
)];

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

const normalizeTicketCodes = (ticketCodes) => {
    if (!Array.isArray(ticketCodes) || ticketCodes.length < 1 || ticketCodes.length > 3) {
        throw buildError(
            "ticketCodes debe contener entre uno y tres tickets.",
            400,
            "Envía entre uno y tres códigos de ticket."
        );
    }

    const normalizedCodes = ticketCodes.map((ticketCode) => normalizeText(ticketCode).toUpperCase());

    if (normalizedCodes.some((ticketCode) => !ticketCode)) {
        throw buildError("Cada ticketCode es obligatorio.", 400, "Envía códigos de ticket válidos.");
    }

    if (new Set(normalizedCodes).size !== normalizedCodes.length) {
        throw buildError("No se pueden facturar tickets repetidos.", 400, "No repitas códigos de ticket.");
    }

    return normalizedCodes;
};

const mapPaymentForm = (ticketPaymentMethod) => TICKET_PAYMENT_FORM_MAP[ticketPaymentMethod] || "99";

const mapPaymentMethod = (ticketPaymentMethod) => ticketPaymentMethod === "IN_DEBT" ? "PPD" : "PUE";

const buildFacturapiCustomerPayload = (customer) => ({
    legal_name: customer.legalName,
    tax_id: customer.taxId,
    tax_system: customer.taxSystem,
    // Facturapi registra un solo correo en el cliente; los demás se usan al enviar el CFDI.
    email: normalizeEmailRecipients(customer.email)[0] || undefined,
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

const saveBillingCustomer = async (customer, invoiceInput) => {

    const rfcClient = customer.taxId;

    const billingCustomerPayload = {
        razonSocial: customer.legalName,
        codigoPostal: customer.taxZipCode,
        email: customer.email.toLowerCase(),
        regimenFiscal: customer.taxSystem,
        invoiceUse: invoiceInput.use,
    };

    const existingCustomer = await BillingCustomer.findOne({ rfc: rfcClient });

    if (existingCustomer) {
        Object.assign(existingCustomer, billingCustomerPayload);
        return existingCustomer.save();
    }

    const clientCode = await generateUniqueCode(BillingCustomer, "FC", 6, "clientCode");

    try {
        return await BillingCustomer.create({
            ...billingCustomerPayload,
            rfc: rfcClient,
            clientCode,
        });
    } catch (error) {
        if (error?.code !== 11000) throw error;

        return BillingCustomer.findOneAndUpdate(
            { rfc: rfcClient },
            { $set: billingCustomerPayload },
            { new: true, runValidators: true }
        );
    }
};

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
    static async processFacturapiInvoice(payload = {}, dependencies = {}) {
        const customer = sanitizeCustomerInput(payload.customer);
        const invoiceInput = normalizeInvoiceInput(payload.invoice);
        const ticket = await getTicketByCode(payload.ticketCode || payload.code_ticket);
        const facturapiClient = dependencies.facturapiClient || getFacturapiClient();

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
            const facturapiCustomer = dependencies.facturapiCustomer || await createFacturapiCustomer(
                facturapiClient,
                customerPayload
            );
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

            let billingCustomer = null;
            let billingCustomerWarning = "";

            try {
                billingCustomer = await saveBillingCustomer(customer, invoiceInput);
            } catch (error) {
                billingCustomerWarning = "No se pudo guardar el cliente fiscal para reutilizarlo.";
                console.error(billingCustomerWarning, error);
            }

            if (invoiceInput.sendEmail) {
                const recipients = normalizeEmailRecipients(customer.email);

                if (recipients.length === 0) {
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
                    await sendFacturapiInvoiceByEmail(facturapiClient, facturapiInvoice.id, recipients);
                    record.emailDelivery = {
                        sent: true,
                        recipients,
                        sentAt: new Date(),
                        lastError: "",
                    };
                } catch (emailError) {
                    record.emailDelivery = {
                        sent: false,
                        recipients,
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
                billingCustomer: billingCustomer ? {
                    id: billingCustomer._id,
                    clientCode: billingCustomer.clientCode,
                } : null,
                billingCustomerWarning: billingCustomerWarning || undefined,
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

    static async processFacturapiInvoices(payload = {}) {
        const customer = sanitizeCustomerInput(payload.customer);
        const invoiceInput = normalizeInvoiceInput(payload.invoice);
        const ticketCodes = normalizeTicketCodes(payload.ticketCodes);

        // Verifica el lote completo antes de crear el cliente o emitir facturas.
        await Promise.all(ticketCodes.map((ticketCode) => getTicketByCode(ticketCode)));

        const facturapiClient = getFacturapiClient();
        const facturapiCustomer = await createFacturapiCustomer(
            facturapiClient,
            buildFacturapiCustomerPayload(customer)
        );
        const invoices = [];

        // Se procesan en orden para que un fallo no impida informar el resultado de los demás tickets.
        for (const ticketCode of ticketCodes) {
            try {
                const result = await this.processFacturapiInvoice(
                    { ticketCode, customer, invoice: invoiceInput },
                    { facturapiClient, facturapiCustomer }
                );

                invoices.push({
                    ok: true,
                    ticketCode,
                    invoiceRecordId: result.invoiceRecordId,
                    facturapiInvoiceId: result.facturapi.invoiceId,
                    emailSent: result.facturapi.emailSent,
                });
            } catch (error) {
                invoices.push({
                    ok: false,
                    ticketCode,
                    statusCode: error.statusCode || 500,
                    message: error.customMessage || error.message,
                });
            }
        }

        const issuedInvoices = invoices.filter((invoice) => invoice.ok);

        return {
            ok: issuedInvoices.length === invoices.length,
            message: issuedInvoices.length === invoices.length
                ? "Facturas generadas correctamente."
                : "Algunos tickets no pudieron facturarse.",
            facturapi: {
                customerId: facturapiCustomer.id,
                livemode: Boolean(facturapiCustomer.livemode),
            },
            invoices,
        };
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

        const recipients = normalizeEmailRecipients(email || record.customer?.email);
        if (recipients.length === 0) {
            throw buildError(
                "No se encontró un correo destino.",
                400,
                "Debes enviar un correo o guardar uno en los datos fiscales."
            );
        }

        const facturapiClient = getFacturapiClient();
        await sendFacturapiInvoiceByEmail(facturapiClient, record.facturapi.invoiceId, recipients);

        record.emailDelivery = {
            sent: true,
            recipients,
            sentAt: new Date(),
            lastError: "",
        };
        await record.save();

        return {
            ok: true,
            invoiceRecordId: record._id,
            facturapiInvoiceId: record.facturapi.invoiceId,
            recipients,
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
