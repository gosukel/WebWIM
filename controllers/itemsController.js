import { validationResult } from "express-validator";
import itemQueries from "../models/db/items.js";

const user = "Richard Routh";

async function itemsGet(req, res) {
    const items = await itemQueries.itemQuery();
    const brands = await itemQueries.getAllBrands();
    const types = await itemQueries.getAllTypes();
    return res.render("index", {
        fullName: user,
        main: "items",
        styles: ["items"],
        items: items,
        brands: brands,
        types: types,
    });
}

async function itemsQuery(req, res) {
    const search = req.query.search || "";
    const sortParam = req.query.sortParams || "";
    const sortDirection = req.query.sortDirection || "";
    const filters = search.split(" ").filter(Boolean);
    let items = await itemQueries.itemQuery(filters, sortParam, sortDirection);
    return res.json(items);
    // return;
}

async function itemsAdd(req, res) {
    const newItem = req.body.newItem;
    // let item = {
    //     item: req.body["item-name"],
    //     number: req.body["item-number"],
    //     brand: req.body["item-brand"],
    //     type: req.body["item-type"],
    //     weight: req.body["item-weight"],
    //     pallet: req.body["item-pallet"],
    //     locations: req.body["item-location"],
    // };

    console.log(`item to add to DB: ${newItem}`);
    try {
        await itemQueries.addItem(newItem);
        return res.status(201).json({ item: newItem });
    } catch {
        return res.status(400).json({ message: "error adding item" });
    }
    return res.status(201).json({ item: newItem });
    // return;
}

async function itemsEdit(req, res) {
    // validation code here?
    let item = {
        itemId: req.body["item-id"],
        item: req.body["item-name"],
        number: req.body["item-number"],
        brand: req.body["item-brand"],
        type: req.body["item-type"],
        weight: req.body["item-weight"],
        pallet: req.body["item-pallet"],
        locations: req.body["item-location"],
    };
    // await itemQueries.editItem(item);
    return res.redirect("/items");
    // return;
}

const itemsController = {
    itemsGet,
    itemsQuery,
    itemsAdd,
    itemsEdit,
};

export default itemsController;
