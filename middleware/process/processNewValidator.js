// import db queries
import processQueries from "../../models/db/process.js";
import itemQueries from "../../models/db/items.js";
import ProcessError from "../../errors/ProcessError.js";

// order number check
async function checkOrderNumber(value) {
    if (!value) {
        throw new ProcessError("Order Number required");
    }
    let orderNum = value.toUpperCase();
    const orderExists = await processQueries.orderQueryExact(orderNum);
    if (orderExists) {
        throw new ProcessError(
            `Order Number '${value.toUpperCase()}' already exists`
        );
    }
    return orderNum;
}

// item name and quantity check
async function checkOrderItems(value) {
    if (!value) {
        throw new ProcessError("Valid Items required");
    }
    let orderItems = [];
    for (let item in value) {
        if (value[item].itemQty <= 0) {
            throw new ProcessError(`Invalid QTY for ${item}`);
        }
        let dbItem = await itemQueries.itemQueryExact({
            type: "name",
            value: item,
        });
        if (!dbItem) {
            throw new ProcessError(`Invalid Item: ${item}`);
        }
        orderItems.push({
            name: dbItem.name,
            id: dbItem.id,
            qty: value[item].itemQty,
        });
    }
    return orderItems;
}

function checkOrderDetails(values) {
    if (!values) {
        throw new ProcessError("Invalid Order Details");
    }
    for (let detail in values) {
        if (Number(detail) <= 0) {
            throw new ProcessError(`Invalid Order Detail value: ${detail}`);
        }
    }
    return values;
}

// validator function
async function validateNewOrder(req, res, next) {
    let orderObj = {
        orderNumber: await checkOrderNumber(req.body.orderNumber),
        orderItems: await checkOrderItems(req.body.orderItems),
        orderDetails: checkOrderDetails(req.body.orderDetails),
    };
    req.orderObject = orderObj;
    next();
}

export default validateNewOrder;
