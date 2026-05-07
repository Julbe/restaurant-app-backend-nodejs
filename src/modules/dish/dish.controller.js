

import BaseController from "../baseController.js";
import { Dish } from "./dish.model.js";


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
                "productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ],
            [
                "modifiers",
                "sides.items",
                "areaMenu_id",
                "productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ]
        );
    }
}
