import processQueries from "../models/db/process.js";
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
    // console.log(items);
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
    // CAS - CONS - DUCT - FLEXX - FLR
    // LIVV - MULTI - SAP - UMAT - VIR
    // GMV - LS - HVAC - PART - OTHER
    res.render("index", {
        fullName: user,
        main: "process",
        styles: ["process"],
        items: items,
        brands,
    });
}

const indexController = {
    indexGet,
    calculateGet,
    processGet,
};

export default indexController;
