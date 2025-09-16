const user = "Richard Routh";
async function indexGet(req, res) {
    // let user = req.session.user?.fullName;
    // let user = "Richard Routh";
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

const indexController = {
    indexGet,
    calculateGet,
};

export default indexController;
