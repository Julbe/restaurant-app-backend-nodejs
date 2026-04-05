
import { buildSafeFilter } from "../libraries/buildSafeFilter.query.js";
import { catchAsync } from "../utils/catchAsync.js";
import { paginate } from "../utils/paginate.query.js";

export default class BaseController {

    constructor(model, modelName = "Item", searchableFields = [], populateAll = [], populateOne = [], defaultFields = []) {
        this.model = model;
        this.modelName = modelName;
        this.searchableFields = searchableFields;
        this.populateAll = populateAll;
        this.populateOne = populateOne;
        this.defaultFields = defaultFields;
    }

    async beforeCreate(req) { return req.body }
    async afterCreate(item, req) { return item }

    async afterGetById(item) { return item }

    async afterGetAll(docs) { return docs }

    async beforeUpdate(req) { return req.body }
    async afterUpdate(item, req) { return item }

    async beforeDelete(req) { return req.body }
    async afterDelete(item, req) { return item }

    async beforeGetAll(req) {
        return [[], ''];
    }

    create = catchAsync(async (req, res) => {
        const data = await this.beforeCreate(req);
        const item = await this.model.create(data);
        const newItem = await this.afterCreate(item, req);
        res.status(201).json(newItem);
    }, `No se pudo agregar ${this.modelName}`);

    async findAll(query) {
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder, _fields = "", populate = "" } = query;

        const result = await this.beforeGetAll(query);

        if (result?.error) {
            throw new Error(result.error);
        }

        const [blocks, omitKeys] = result;

        let filter = buildSafeFilter(query, this.searchableFields, omitKeys);

        if (blocks.length > 0) {
            filter = {
                $and: [filter, ...blocks]
            };
        }

        const fields = _fields?.split(",").join(" ") || this.defaultFields?.join(" ") || "";
        const _populate = populate?.split(",") || this.populateAll || [];

        return paginate({
            model: this.model,
            filter,
            page: Number(page),
            limit: Number(limit),
            sortBy,
            sortOrder,
            populate: _populate,
            _fields: fields
        });
    }

    getAll = catchAsync(async (req, res) => {
        const payload = await this.findAll(req.query);
        const prev = await this.afterGetAll(payload);
        res.json(prev);
    }, () => ([`No se pudo consultar registros.`, `Controllador: ${this.modelName}`]));


    getById = catchAsync(async (req, res) => {
        let query = this.model.findById(req.params.id).lean();
        if (Array.isArray(this.populateOne) && this.populateOne.length > 0) {
            this.populateOne.forEach((pop) => {
                query = query.populate(pop);
            });
        }
        const item = await query.exec();
        if (!item) return res.status(404).json({ error: "No encontrado" });
        const processedItem = await this.afterGetById(item);
        res.json(processedItem);
    }, () => ([`No se pudo consultar.`, `Controllador: ${this.modelName}`]));

    update = catchAsync(async (req, res) => {


        const data = await this.beforeUpdate(req);
        const item = await this.model.findByIdAndUpdate(req.params.id, data, { new: true });

        if (!item) return res.status(404).json({ error: "No encontrado" });
        const newItem = await this.afterUpdate(item, req);

        res.json(newItem);
    }, `No se pudo actualizar`);

    delete = catchAsync(async (req, res) => {
        const item = await this.model.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "No encontrado" });

        await this.beforeDelete(req, item);
        await item.deleteOne();
        await this.afterDelete(item, req);

        res.json({ message: `${this.modelName} | Registro eliminado con éxito` });
    }, `No se pudo eliminar`);
}
