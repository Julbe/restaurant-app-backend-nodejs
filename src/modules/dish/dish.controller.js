

import BaseController from "../baseController.js";
import { Dish } from "./dish.model.js";

function normalizeDishPayload(body = {}) {
    const productIds = Array.isArray(body.productIds)
        ? body.productIds.filter(Boolean)
        : body.productId
            ? [body.productId]
            : [];

    return {
        ...body,
        productIds,
        productId: productIds[0] ?? null,
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
}
