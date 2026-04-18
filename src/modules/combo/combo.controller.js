
import BaseController from "../baseController.js";
import { Combo } from "./combo.model.js";

export default class ComboController extends BaseController {
    constructor() {
        super(Combo, "Combo", ["name", "description"]);
    }
}


