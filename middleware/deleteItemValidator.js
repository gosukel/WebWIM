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

    const itemIDExists = await itemQueries.itemQueryExactID(idNum);
    if (!itemIDExists) {
        throw new ItemError("Item number already exists");
    }
    return idNum;
}

async function validateDelItem(req, res, next) {
    const delId = await checkItemId(req.body["id"]);
    req.body.delId = delId;
    next();
}

export default validateDelItem;
