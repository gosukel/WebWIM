import itemQueries from "../models/db/items.js";
import locationQueries from "../models/db/locations.js";
import ItemError from "../errors/ItemError.js";

async function checkItemName(value, id) {
    if (value === "") {
        throw new ItemError("Item name required");
    }
    const itemName = value.toUpperCase();

    const doesExist = await itemQueries.itemQueryExactName(itemName, id);

    if (doesExist) {
        console.log("duplicate name");
        throw new ItemError("Item name already exists");
    }
    return itemName;
}

async function checkItemNumber(value, id) {
    if (value === "") {
        throw new ItemError("item number required");
    }
    let itemNumberString = value;

    if (!Number(itemNumberString)) {
        throw new ItemError("Item number not valid number");
    }

    const itemNumberExists = await itemQueries.itemQueryExactNumber(
        itemNumberString,
        id
    );
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
        return locations;
    }
    let locationList = locations.split(" ");
    let locIds = [];
    let locationsWithIds = [];
    for (const loc of locationList) {
        if (!loc) {
            continue;
        }
        let locInfo = await locationQueries.locationQueryExact(
            loc.toUpperCase()
        );

        if (!locInfo) {
            throw new ItemError(`Location '${loc}' does not exist`);
        }
        // check for duplicate locations being added
        if (!locIds.includes(locInfo.id)) {
            locationsWithIds.push(locInfo);
            locIds.push(locInfo.id);
        }
    }
    return locationsWithIds;
}

// let item = {
//     itemId: req.body["item-id"],
//     item: req.body["item-name"],
//     number: req.body["item-number"],
//     brand: req.body["item-brand"],
//     type: req.body["item-type"],
//     weight: req.body["item-weight"],
//     pallet: req.body["item-pallet"],
//     locations: req.body["item-location"],
// };

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
