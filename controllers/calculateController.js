const user = "Richard Routh";

async function calculateGet(req, res) {
    res.render("index", {
        fullName: user,
        main: "calculator",
        styles: ["calculator"],
    });
}

const calculateController = {
    calculateGet,
};

export default calculateController;
