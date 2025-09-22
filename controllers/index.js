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

async function calculateGet(req, res) {
    res.render("index", {
        fullName: user,
        main: "calculator",
        styles: ["calculator"],
    });
}

async function processGet(req, res) {
    const items = await processQueries.getItems();
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

async function itemsGet(req, res) {
    const items = await itemQueries.getAllItems();
    res.render("index", {
        fullName: user,
        main: "items",
        styles: ["items"],
        items: items,
        testItem: items[0],
    });
}

const indexController = {
    indexGet,
    calculateGet,
    processGet,
    itemsGet,
};

export default indexController;
