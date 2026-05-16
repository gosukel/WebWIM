import itemQueries from "../../models/db/items.js";
import WarehouseError from "../../errors/WarehouseError.js";

async function checkItemName(value, id) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item NAME required");
    }
    const itemName = value.toUpperCase();

    const doesExist = await itemQueries.itemQueryExact({
        type: "name",
        value: itemName,
        id: id,
    });

    if (doesExist) {
        throw new WarehouseError("Item Error", "Item NAME already exists");
    }
    return itemName;
}

async function checkItemNumber(value, id) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item NUMBER required");
    }
    let itemNumberString = value;

    if (!Number(itemNumberString)) {
        throw new WarehouseError("Item Error", "Item NUMBER not valid number");
    }

    const itemNumberExists = await itemQueries.itemQueryExact({
        type: "number",
        value: itemNumberString,
        id: id,
    });
    if (itemNumberExists) {
        throw new WarehouseError("Item Error", "Item NUMBER already exists");
    }
    return itemNumberString;
}

async function checkItemBrand(value) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item BRAND required");
    }
    const itemBrand = value.toUpperCase();
    const itemBrandExists = await itemQueries.itemQueryExact({
        type: "brand",
        value: itemBrand,
    });
    if (!itemBrandExists) {
        throw new WarehouseError("Item Error", "Item BRAND does not exist");
    }
    return itemBrand;
}

async function checkItemType(value) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item TYPE required");
    }
    const itemType = value.toUpperCase();
    const itemTypeExists = await itemQueries.itemQueryExact({
        type: "type",
        value: itemType,
    });
    if (!itemTypeExists) {
        throw new WarehouseError("Item Error", "Item TYPE does not exist");
    }
    return itemType;
}

async function checkItemWeight(value) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item WEIGHT required");
    }
    let itemWeight = Number(value);
    if (!itemWeight || itemWeight <= 0) {
        throw new WarehouseError("Item Error", "Invalid value for Item WEIGHT");
    }

    return itemWeight;
}

async function checkItemPallet(value) {
    if (value === "") {
        throw new WarehouseError("Item Error", "Item FULL PALLET required");
    }
    let itemPallet = Number(value);
    if (!itemPallet || itemPallet <= 0) {
        throw new WarehouseError(
            "Item Error",
            "Invalid value for FULL PALLET quantity"
        );
    }

    return itemPallet;
}

async function checkItemLocations(value) {
    let locations = value.trim();
    if (locations === "") {
        return locations;
    }
    let locationList = locations.split(" ");
    let locIds = [];
    let locationsWithIds = [];
    for (const loc of locationList) {
        if (!loc) {
            continue;
        }
        let locInfo = await itemQueries.itemLocationQueryExact(
            loc.toUpperCase()
        );

        if (!locInfo) {
            throw new WarehouseError(
                "Location Error",
                `LOCATION ${loc} does not exist`
            );
        }
        // check for duplicate locations being added
        if (!locIds.includes(locInfo.id)) {
            locationsWithIds.push(locInfo);
            locIds.push(locInfo.id);
        }
    }
    return locationsWithIds;
}

async function validateEditItem(req, res, next) {
    let itemId = Number(req.body["item-id"]);
    const editItem = {
        id: itemId,
        name: await checkItemName(req.body["item-name"], itemId),
        number: await checkItemNumber(req.body["item-number"], itemId),
        brand: await checkItemBrand(req.body["item-brand"]),
        type: await checkItemType(req.body["item-type"]),
        weight: await checkItemWeight(req.body["item-weight"]),
        palletQty: await checkItemPallet(req.body["item-pallet"]),
        locations: await checkItemLocations(req.body["item-location"]),
    };
    req.editItem = editItem;
    next();
}

export default validateEditItem;
