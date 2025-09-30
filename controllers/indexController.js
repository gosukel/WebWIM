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

const indexController = {
    indexGet,
};

export default indexController;
