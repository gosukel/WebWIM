async function calculateGet(req, res) {
    res.render("index", {
        main: "calculator",
        styles: ["calculator"],
    });
}

const calculateController = {
    calculateGet,
};

export default calculateController;
