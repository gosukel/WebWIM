async function indexGet(req, res) {
    res.render("index", {
        fullName: req.user.fullName,
        main: "home",
        styles: ["home"],
    });
}

const indexController = {
    indexGet,
};

export default indexController;
