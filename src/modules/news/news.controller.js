import { catchAsync } from "../../utils/catchAsync.js";
import BaseController from "../baseController.js";
import { News } from "./news.model.js";



export default class NewsController extends BaseController {

    constructor() {
        super(News, "News", ["title", "subtitle", "excerpt", "body"]);
    }

    findVisible = catchAsync(async (req, res) => {
        const restaurantId = req.query.restaurantId ?? undefined;
        const news = await News.findVisible({ restaurantId });
        res.json(news);
    }, () => ([`No se pudo consultar.`, `Controllador: ${this.modelName}`]));



}