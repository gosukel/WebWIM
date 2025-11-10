import itemQueries from "../../models/db/items.js";
import ItemError from "../../errors/ItemError.js";

async function checkItemName(value) {
    if (value === "") {
        throw new ItemError("Item NAME required");
    }
    const itemName = value.toUpperCase();
    const doesExist = await itemQueries.itemQueryExact({
        type: "name",
        value: itemName,
    });
    if (doesExist) {
        throw new ItemError("Item NAME already exists");
    }
    return itemName;
}

async function checkItemNumber(value) {
    if (value === "") {
        throw new ItemError("item NUMBER required");
    }
    let itemNumberString = value;

    if (!Number(itemNumberString)) {
        throw new ItemError("Item NUMBER not valid number");
    }

    const itemNumberExists = await itemQueries.itemQueryExact({
        type: "number",
        value: itemNumberString,
    });
    if (itemNumberExists) {
        throw new ItemError("Item NUMBER already exists");
    }
    return itemNumberString;
}

async function checkItemBrand(value) {
    if (value === "") {
        throw new ItemError("Item BRAND required");
    }
    const itemBrand = value.toUpperCase();
    const itemBrandExists = await itemQueries.itemQueryExact({
        type: "brand",
        value: itemBrand,
    });
    if (!itemBrandExists) {
        throw new ItemError("Item BRAND does not exist");
    }
    return itemBrand;
}

async function checkItemType(value) {
    if (value === "") {
        throw new ItemError("Item TYPE required");
    }
    const itemType = value.toUpperCase();
    const itemTypeExists = await itemQueries.itemQueryExact({
        type: "type",
        value: itemType,
    });
    if (!itemTypeExists) {
        throw new ItemError("Item TYPE does not exist");
    }
    return itemType;
}

async function checkItemWeight(value) {
    if (value === "") {
        throw new ItemError("Item WEIGHT required");
    }
    let itemWeight = Number(value);
    if (!itemWeight || itemWeight <= 0) {
        throw new ItemError("Invalid value for item WEIGHT");
    }

    return itemWeight;
}

async function checkItemPallet(value) {
    if (value === "") {
        throw new ItemError("FULL PALLET Quantity required");
    }
    let itemPallet = Number(value);
    if (!itemPallet || itemPallet <= 0) {
        throw new ItemError("Invalid value for FULL PALLET quantity");
    }

    return itemPallet;
}

async function checkItemLocations(value) {
    let locations = value.trim();
    if (locations === "") {
        throw new ItemError("Item LOCATION required");
    }
    let locationList = locations.split(" ");
    let locationsWithIds = [];

    for (const loc of locationList) {
        let locId = await itemQueries.itemLocationQueryExact(loc.toUpperCase());
        if (!locId) {
            throw new ItemError(
                `LOCATION '${loc}' does not exist.  If adding multiple locations, leave a space between each location: "loc1 loc2"`
            );
        }
        locationsWithIds.push(locId);
    }
    return locationsWithIds;
}

async function validateNewItem(req, res, next) {
    const newItem = {
        name: await checkItemName(req.body["item-name"]),
        number: await checkItemNumber(req.body["item-number"]),
        brand: await checkItemBrand(req.body["item-brand"]),
        type: await checkItemType(req.body["item-type"]),
        weight: await checkItemWeight(req.body["item-weight"]),
        pallet: await checkItemPallet(req.body["item-pallet"]),
        locations: await checkItemLocations(req.body["item-location"]),
    };

    req.newItem = newItem;
    next();
}

export default validateNewItem;
