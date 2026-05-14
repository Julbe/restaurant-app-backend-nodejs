

import BaseController from "../baseController.js";
import { Dish } from "./dish.model.js";
import { catchAsync } from "../../utils/catchAsync.js";

function normalizeDishPayload(body = {}) {
    const productIds = Array.isArray(body.productIds)
        ? body.productIds.filter(Boolean)
        : body.productId
            ? [body.productId]
            : [];

    const preparationArea = typeof body.preparationArea === "string" && body.preparationArea.trim()
        ? body.preparationArea.trim()
        : undefined;

    return {
        ...body,
        productIds,
        productId: productIds[0] ?? null,
        ...(preparationArea ? { preparationArea } : {}),
    };
}

export default class DishController extends BaseController {
    constructor() {
        super(
            Dish,
            "Dish",
            ["name", "detail"],
            [
                "modifiers",
                "sides.items",
                "areaMenu_id",
                "productIds",
                "productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ],
            [
                "modifiers",
                "sides.items",
                "areaMenu_id",
                "productIds",
                "productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ]
        );
    }

    async beforeCreate(req) {
        return normalizeDishPayload(req.body);
    }

    async beforeUpdate(req) {
        return normalizeDishPayload(req.body);
    }

    update = catchAsync(async (req, res) => {
        const data = await this.beforeUpdate(req);
        const item = await this.model.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true, runValidators: true, context: "query" }
        );

        if (!item) return res.status(404).json({ error: "No encontrado" });

        const newItem = await this.afterUpdate(item, req);
        res.json(newItem);
    }, "No se pudo actualizar");
}
