

import BaseController from "../baseController.js";
import { Dish } from "./dish.model.js";


export default class DishController extends BaseController {
    constructor() {
        super(Dish, "Dish", ["name"], [], ["modifiers", "sides.items"]);
    }
}


