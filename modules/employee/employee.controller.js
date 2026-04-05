
import BaseController from "../baseController.js";
import { Employee } from "./employee.model.js";


export default class EmployeeController extends BaseController {
    constructor() {
        super(Employee, "Employee",
            ["firstName", "firstName", "rfc",
                "nss", "position", "hireDate",
                "vacationDays", "usedVacationDays", "birthDate"]);
    }
}

