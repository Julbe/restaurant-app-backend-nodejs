import { catchAsync } from "../../utils/catchAsync.js";
import BaseController from "../baseController.js";
import { News } from "./news.model.js";



export default class NewsController extends BaseController {

    constructor() {
        super(News, "News", ["title", "subtitle", "excerpt", "body"], ["updatedBy", "createdBy"], ["updatedBy", "createdBy"], [], { "createdBy": "user", "updatedBy": "user" });
    }

    findVisible = catchAsync(async (req, res) => {
        const restaurantId = req.query.restaurantId ?? undefined;
        const news = await News.findVisible({ restaurantId });
        res.json(news);
    }, () => ([`No se pudo consultar.`, `Controllador: ${this.modelName}`]));

    incrementMetricValue = async (id, metric) => {
        const allowedMetrics = ["views", "clicks"];

        if (!allowedMetrics.includes(metric)) {
            throw new Error("Métrica no válida");
        }

        return News.findByIdAndUpdate(
            id,
            { $inc: { [`metrics.${metric}`]: 1 } },
            { new: true }
        );
    };

    incrementViews = catchAsync(async (req, res) => {
        const item = await this.incrementMetricValue(req.params.id, "views");

        if (!item) return res.status(404).json({ error: "No encontrado" });

        res.json(item);
    }, () => ([`No se pudo incrementar vistas.`, `Controllador: ${this.modelName}`]));

    incrementClicks = catchAsync(async (req, res) => {
        const item = await this.incrementMetricValue(req.params.id, "clicks");

        if (!item) return res.status(404).json({ error: "No encontrado" });

        res.json(item);
    }, () => ([`No se pudo incrementar clicks.`, `Controllador: ${this.modelName}`]));


}
