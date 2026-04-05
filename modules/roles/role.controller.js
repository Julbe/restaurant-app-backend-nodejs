import BaseController from "../baseController.js";
import { Role } from "./role.model.js";

export default class RoleController extends BaseController {
    constructor() {
        super(Role, "Role");
    }
}

