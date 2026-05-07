import BaseController from "../baseController.js";
import { Product } from "./product.model.js";

export default class ProductController extends BaseController {
    constructor() {
        super(
            Product,
            "Product",
            ["name", "description", "detail", "sku", "tags"],
            ["modifiers"],
            ["modifiers"]
        );
    }
}
