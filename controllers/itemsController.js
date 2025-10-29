import itemQueries from "../models/db/items.js";
import noteQueries from "../models/db/notes.js";

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
}

async function itemsAdd(req, res) {
    const newItem = req.body.newItem;
    try {
        const itemAdded = await itemQueries.addItem(newItem);
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

async function itemsDelete(req, res) {
    const delId = req.body.delId;
    const delName = req.body.delName;
    try {
        await itemQueries.deleteItem(delId, delName);
        return res.status(201).json({ success: "Edit Successful!" });
    } catch {
        return res.status(400).json({ message: "error deleting item" });
    }
}

async function itemNotesQuery(req, res) {
    const eId = Number(req.query.eId);
    const eName = req.query.eName;
    const eType = req.query.eType;
    const noteType = req.query.noteType;
    try {
        const notes = await noteQueries.itemNoteQuery(
            eId,
            eName,
            eType,
            noteType
        );
        return res.json(notes);
    } catch {
        return res.status(400).json({ message: "error getting notes" });
    }
}

const itemsController = {
    itemsGet,
    itemsQuery,
    itemsAdd,
    itemsEdit,
    itemsDelete,
    itemNotesQuery,
};

export default itemsController;
