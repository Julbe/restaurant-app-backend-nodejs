import { generateCode } from "../../utils/generateCodes.js";
import BaseController from "../baseController.js";
import { Table } from "./table.model.js";

export default class TableController extends BaseController {
    constructor() {
        super(
            Table,
            "Mesa",
            ["table", "code"]
        );
    }

    async afterCreate(item) {
        let code = item.code;
        let exists = true;

        while (exists) {
            code = generateCode("T");
            exists = await Table.exists({ code, _id: { $ne: item._id } });
        }

        item.code = code;
        await item.save();

        return item;
    }
}
