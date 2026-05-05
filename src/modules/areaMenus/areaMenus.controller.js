import BaseController from "../baseController.js";
import { AreaMenu } from "./areaMenus.model.js";
import { Dish } from "../dish/dish.model.js";

export default class AreaMenuController extends BaseController {
    constructor() {
        super(AreaMenu, "AreaMenu", ["name"]);
    }

    async findAll(query) {
        return super.findAll({
            ...query,
            sortBy: query.sortBy || "sortOrder",
            sortOrder: query.sortOrder || "asc",
        });
    }

    async beforeDelete(req, item) {
        await Dish.updateMany(
            { areaMenu_id: item._id },
            { $set: { areaMenu_id: null } }
        );
    }
}
