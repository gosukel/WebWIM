import itemQueries from "../../models/db/items.js";
import WarehouseError from "../../errors/WarehouseError.js";

async function checkItemId(value) {
    if (value === "") {
        throw new WarehouseError("ItemError", "No Item ID");
    }
    let idNum = Number(value);
    if (!idNum) {
        throw new WarehouseError("ItemError", "Invalid Item ID");
    }

    return idNum;
}

async function checkItemName(value) {
    if (value === "") {
        throw new WarehouseError("ItemError", "Item name required");
    }
    const itemName = value.toUpperCase();

    const doesExist = await itemQueries.itemQueryExact({
        type: "name",
        value: itemName,
    });

    if (!doesExist) {
        throw new WarehouseError(
            "ItemError",
            `Item ${itemName} does not exist`
        );
    }
    return itemName;
}

async function validateDelItem(req, res, next) {
    const delItem = {
        delId: await checkItemId(req.body["id"]),
        delName: await checkItemName(req.body["name"]),
    };
    req.delItem = delItem;
    next();
}

export default validateDelItem;
