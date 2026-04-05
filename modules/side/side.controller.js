import BaseController from "../baseController.js";
import { Side } from "./side.model.js";

export default class SideController extends BaseController {
    constructor() {
        super(Side, "Side", ["name", "description"]);
    }
}


