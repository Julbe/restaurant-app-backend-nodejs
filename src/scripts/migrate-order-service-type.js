import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db.js";
import { Order } from "../modules/orders/order.model.js";

dotenv.config();

const SERVICE_TYPES = ["takeOut", "here"];

const resolveServiceType = (order) => {
    const orderServiceType = order.serviceType;
    const ticketServiceType = order.ticketId?.serviceType;

    if (SERVICE_TYPES.includes(orderServiceType)) {
        return orderServiceType;
    }

    if (SERVICE_TYPES.includes(ticketServiceType)) {
        return ticketServiceType;
    }

    return "here";
};

const migrate = async () => {
    await connectDB();

    const orders = await Order.find({
        $or: [
            { serviceType: { $exists: false } },
            { serviceType: null },
            { serviceType: "" },
        ],
    })
        .select("_id serviceType ticketId")
        .populate({ path: "ticketId", select: "serviceType" })
        .lean();

    if (orders.length === 0) {
        console.log("No hay órdenes pendientes por migrar.");
        return;
    }

    const bulkOps = orders.map((order) => ({
        updateOne: {
            filter: { _id: order._id },
            update: { $set: { serviceType: resolveServiceType(order) } },
        },
    }));

    const result = await Order.bulkWrite(bulkOps, { ordered: false });

    console.log(`Órdenes revisadas: ${orders.length}`);
    console.log(`Órdenes actualizadas: ${result.modifiedCount}`);
};

try {
    await migrate();
} catch (error) {
    console.error("Error migrando serviceType a órdenes:", error);
    process.exitCode = 1;
} finally {
    await mongoose.connection.close();
}
