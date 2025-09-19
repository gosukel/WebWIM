// import fakeUser from "../models/fakeDB.js";

async function loginPost(req, res) {
    const { username, password } = req.body;
    if (fakeUser.username == username && fakeUser.password == password) {
        req.session.user = {
            fullName: fakeUser.fullName,
        };
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
}

async function loginGet(req, res) {
    res.render("login");
}

const loginController = {
    loginPost,
    loginGet,
};

export default loginController;
