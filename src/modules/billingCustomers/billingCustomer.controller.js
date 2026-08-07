import BaseController from "../baseController.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { generateUniqueCode } from "../../utils/generateCodes.js";
import { BillingCustomer } from "./billingCustomer.model.js";

const normalizeText = (value = "") => String(value).trim();

const normalizeCustomerData = (payload = {}) => {
    const data = { ...payload };

    if (data.rfc !== undefined) data.rfc = normalizeText(data.rfc).toUpperCase();
    if (data.razonSocial !== undefined) data.razonSocial = normalizeText(data.razonSocial);
    if (data.codigoPostal !== undefined) data.codigoPostal = normalizeText(data.codigoPostal);
    if (data.email !== undefined) data.email = normalizeText(data.email).toLowerCase();
    if (data.regimenFiscal !== undefined) data.regimenFiscal = normalizeText(data.regimenFiscal);
    if (data.invoiceUse !== undefined) data.invoiceUse = normalizeText(data.invoiceUse).toUpperCase();

    return data;
};

export default class BillingCustomerController extends BaseController {
    constructor() {
        super(
            BillingCustomer,
            "Cliente fiscal",
            ["rfc", "clientCode", "razonSocial", "email"]
        );
    }

    async beforeCreate(req) {
        const data = normalizeCustomerData(req.body);
        data.clientCode = await generateUniqueCode(BillingCustomer, "FC", 6, "clientCode");
        return data;
    }

    async beforeUpdate(req) {
        const data = normalizeCustomerData(req.body);
        delete data.clientCode;
        return data;
    }

    search = catchAsync(async (req, res) => {
        const searchValue = normalizeText(req.params.searchValue).toUpperCase();

        if (!searchValue) {
            return res.status(400).json({ error: "searchValue es requerido" });
        }

        const customer = await BillingCustomer.findOne({
            $or: [
                { rfc: searchValue },
                { clientCode: searchValue },
            ],
        }).lean();

        if (!customer) {
            return res.status(404).json({ error: "Cliente fiscal no encontrado" });
        }

        return res.json(customer);
    }, "No se pudo buscar el cliente fiscal");
}
