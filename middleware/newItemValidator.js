import itemQueries from "../models/db/items.js";
import locationQueries from "../models/db/locations.js";
import ItemError from "../errors/ItemError.js";

async function checkItemName(value) {
    if (value === "") {
        throw new ItemError("Item name required");
    }
    const itemName = value.toUpperCase();
    const doesExist = await itemQueries.itemQueryExactName(itemName);
    if (doesExist) {
        console.log("duplicate name");
        throw new ItemError("Item name already exists");
    }
    return itemName;
}

async function checkItemNumber(value) {
    if (value === "") {
        throw new ItemError("item number required");
    }
    let itemNumberString = value;

    if (!Number(itemNumberString)) {
        throw new ItemError("Item number not valid number");
    }

    const itemNumberExists =
        await itemQueries.itemQueryExactNumber(itemNumberString);
    if (itemNumberExists) {
        throw new ItemError("Item number already exists");
    }
    return itemNumberString;
}

async function checkItemBrand(value) {
    if (value === "") {
        throw new ItemError("Item brand required");
    }
    const itemBrand = value.toUpperCase();
    const itemBrandExists = await itemQueries.itemQueryExactBrand(itemBrand);
    if (!itemBrandExists) {
        throw new Error("Item brand does not exist");
    }
    return itemBrand;
}

async function checkItemType(value) {
    if (value === "") {
        throw new ItemError("Item type required");
    }
    const itemType = value.toUpperCase();
    const itemTypeExists = await itemQueries.itemQueryExactType(itemType);
    if (!itemTypeExists) {
        throw new ItemError("Item type does not exist");
    }
    return itemType;
}

async function checkItemWeight(value) {
    if (value === "") {
        throw new ItemError("Item weight required");
    }
    let itemWeight = Number(value);
    if (!itemWeight || itemWeight <= 0) {
        throw new ItemError("Invalid value for item weight");
    }

    return itemWeight;
}

async function checkItemPallet(value) {
    if (value === "") {
        throw new ItemError("Full Pallet Quantity required");
    }
    let itemPallet = Number(value);
    if (!itemPallet || itemPallet <= 0) {
        throw new ItemError("Invalid value for full pallet quantity");
    }

    return itemPallet;
}

async function checkItemLocations(value) {
    let locations = value.trim();
    if (locations === "") {
        throw new ItemError("Item location required");
    }
    let locationList = locations.split(" ");
    let locationsWithIds = [];

    for (const loc of locationList) {
        let locId = await locationQueries.locationQueryExact(loc.toUpperCase());
        if (!locId) {
            throw new ItemError(
                `Location '${loc}' does not exist.  If adding multiple locations, leave a space between each location: "loc1 loc2"`
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

    req.body.newItem = newItem;
    next();
}

export default validateNewItem;
