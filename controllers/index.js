async function indexGet(req, res) {
    // let user = req.session.user?.fullName;
    let user = "Richard Routh";
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
