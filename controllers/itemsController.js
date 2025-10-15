import itemQueries from "../models/db/items.js";

const user = "Richard Routh";

async function itemsGet(req, res) {
    const items = await itemQueries.itemQuery();
    const brands = await itemQueries.getAllBrands();
    const types = await itemQueries.getAllTypes();
    // console.log(items[0].locations);
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

    try {
        await itemQueries.addItem(newItem);
        return res.status(201).json({ success: "Item Added Successfully!" });
    } catch {
        return res.status(400).json({ message: "error adding item" });
    }
}

async function itemsEdit(req, res) {
    const editItem = req.editItem;
    try {
        await itemQueries.editItem(editItem);
        return res.status(201).json({ success: "Edit Successful!" });
    } catch {
        return res.status(400).json({ message: "error adding item" });
    }
}

const itemsController = {
    itemsGet,
    itemsQuery,
    itemsAdd,
    itemsEdit,
};

export default itemsController;
