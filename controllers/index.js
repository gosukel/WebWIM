import { validationResult } from "express-validator";
import processQueries from "../models/db/process.js";
import itemQueries from "../models/db/items.js";

const user = "Richard Routh";

async function indexGet(req, res) {
    if (!user) {
        res.redirect("/login");
    } else {
        res.render("index", {
            fullName: user,
            main: "home",
            styles: ["home"],
        });
    }
}

// calculate
async function calculateGet(req, res) {
    res.render("index", {
        fullName: user,
        main: "calculator",
        styles: ["calculator"],
    });
}

// process
async function processGet(req, res) {
    const items = await itemQueries.itemQuery();
    const brands = [
        "CAS",
        "CONS",
        "DUCT",
        "FLEXX",
        "FLR",
        "LIVV",
        "MULTI",
        "SAP",
        "UMAT",
        "VIR",
        "GMV",
        "LS",
        "HVAC",
        "PART",
        "OTHER",
    ];
    res.render("index", {
        fullName: user,
        main: "process",
        styles: ["process"],
        items: items,
        brands,
    });
}

// items
async function itemsGet(req, res) {
    const items = await itemQueries.itemQuery();
    const brands = await itemQueries.getAllBrands();
    const types = await itemQueries.getAllTypes();
    res.render("index", {
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
    res.json(items);
    return;
}

async function itemsSort(req, res) {
    const sortParam = req.query.sortParams;
    const sortDirection = req.query.sortDirection;
    const sortQuery = req.query.sortQuery;
    const items = await itemQueries.sortItems(sortParam, sortDirection);
    res.json(items);
    return;
}

async function itemsBrands(req, res) {
    const brands = await itemQueries.getAllBrands();
    res.json(items);
    return;
}

async function itemsTypes(req, res) {
    const types = await itemQueries.getAllTypes();
    res.json(types);
    return;
}

async function itemsAdd(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const items = await itemQueries.itemQuery();
        const brands = await itemQueries.getAllBrands();
        const types = await itemQueries.getAllTypes();
        console.log(errors.array());
        return res.status(400).render("index", {
            fullName: user,
            main: "items",
            styles: ["items"],
            items: items,
            brands: brands,
            types: types,
            errors: errors.array().map((e) => `${e.path} - ${e.msg}, `),
        });
    }
    let item = {
        item: req.body["item-name"],
        number: req.body["item-number"],
        brand: req.body["item-brand"],
        type: req.body["item-type"],
        weight: req.body["item-weight"],
        pallet: req.body["item-pallet"],
        locations: req.body["item-location"],
    };
    console.log(item);
    // let itemCheck = await itemQueries.itemQueryExact(item);
    // if (itemCheck) console.log("item exists");
    // console.log(itemCheck);
    res.redirect("/items");
    return;
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

    await itemQueries.editItem(item);
    res.redirect("/items");
    return;
}

const indexController = {
    indexGet,
    calculateGet,
    processGet,
    itemsGet,
    itemsQuery,
    itemsSort,
    itemsAdd,
    itemsEdit,
    itemsBrands,
    itemsTypes,
};

export default indexController;
