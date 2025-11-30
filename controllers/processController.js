import itemQueries from "../models/db/items.js";
import processQueries from "../models/db/process.js";
const user = "Richard Routh";

async function processGet(req, res) {
    const items = await itemQueries.itemQuery();
    const brands = [
        "CAS",
        "CONS",
        "DUCT",
        "FLEXX",
        "FLR",
        "LIVV",
        "MULTI",
        "SAP",
        "UMAT",
        "VIR",
        "GMV",
        "LS",
        "HVAC",
        "PART",
        "OTHER",
    ];
    res.render("index", {
        fullName: user,
        main: "process",
        styles: ["process"],
        items: items,
        brands,
    });
}

async function orderQuery(req, res) {
    const search = req.query.search || "";
    const filters = search.split(" ").filter(Boolean);
    let orders;
    if (req.query.type === "exact") {
        orders = await processQueries.orderQueryExact(filters[0]);
    } else {
        orders = await processQueries.orderQuery(filters);
    }
    return res.json(orders);
}

async function processAdd(req, res) {
    let orderObject = req.orderObject;
    try {
        await processQueries.addOrder(orderObject);
        return res.status(201).json({
            success: `Order ${orderObject.orderNumber} Saved Successfully!`,
        });
    } catch {
        return res.status(400).json({ message: "error saving order" });
    }
}

const processController = {
    processGet,
    processAdd,
    orderQuery,
};

export default processController;
