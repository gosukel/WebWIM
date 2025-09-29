import itemQueries from "../models/db/items.js";
import locationQueries from "../models/db/locations.js";

import { body } from "express-validator";

async function isNewItemName(value) {
    const itemName = await itemQueries.itemQueryExactName(value);
    if (itemName) {
        console.log("duplicate name");
        throw new Error("Item name already exists");
    }
}

async function isNewItemNumber(value) {
    const itemNumber = await itemQueries.itemQueryExactNumber(value);
    if (itemNumber) {
        console.log("duplicate number");
        throw new Error("Item number already exists");
    }
}

async function brandExists(value) {
    const brand = await itemQueries.itemQueryExactBrand(value);
    if (!brand) {
        console.log("bad brand");
        throw new Error("Brand does not exist");
    }
}

async function locationsExist(value) {
    locationList = value.replaceAll(" ", "").split(",");
    locationList.forEach((loc) => {
        let result = locationQueries.locationQueryExact(loc);
        if (!result) {
            console.log("bad location");
            throw new Error(`Location '${loc}' does not exist`);
        }
    });
}

const validateNewItem = [
    body("item-name").exists().notEmpty().toUpperCase().custom(isNewItemName),
    body("item-number").exists().notEmpty().custom(isNewItemNumber),
    body("item-brand").exists().notEmpty().toUpperCase().custom(brandExists),
    body("item-location")
        .exists()
        .notEmpty()
        .toUpperCase()
        .custom(locationsExist),
];
// itemId: req.body["item-id"],
// item: req.body["item-name"],
// number: req.body["item-number"],
// brand: req.body["item-brand"],
// type: req.body["item-type"],
// weight: req.body["item-weight"],
// pallet: req.body["item-pallet"],
// locations: req.body["item-location"],

export default validateNewItem;
