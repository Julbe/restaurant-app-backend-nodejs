
import BaseController from "../baseController.js";
import { Combo } from "./combo.model.js";

export default class ComboController extends BaseController {
    constructor() {
        super(
            Combo,
            "Combo",
            ["name", "description", "group"],
            [
                "options.dish",
                "sides.items",
                "components.productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ],
            [
                "options.dish",
                "sides.items",
                "components.productId",
                "selectionGroups.options.dishId",
                "selectionGroups.options.productId",
                "selectionGroups.options.sideId",
            ]
        );
    }
}

