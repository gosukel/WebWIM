import itemQueries from "../models/db/items.js";
import ItemError from "../errors/ItemError.js";

async function checkItemId(value) {
    if (value === "") {
        throw new ItemError("No Item ID");
    }
    let idNum = Number(value);
    if (!idNum) {
        throw new ItemError("Invalid Item ID");
    }

    return idNum;
}

async function checkItemName(value) {
    if (value === "") {
        throw new ItemError("Item name required");
    }
    const itemName = value.toUpperCase();

    const doesExist = await itemQueries.itemQueryExactName(itemName);

    if (!doesExist) {
        console.log("duplicate name");
        throw new ItemError("Item name does not exist");
    }
    return itemName;
}

async function validateDelItem(req, res, next) {
    const delId = await checkItemId(req.body["id"]);
    const delName = await checkItemName(req.body["name"]);
    req.body.delId = delId;
    req.body.delName = delName;
    next();
}

export default validateDelItem;
