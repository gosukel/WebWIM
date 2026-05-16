async function loginGet(req, res) {
    // get error message if exist
    const error = req.session.messages?.[0];
    req.session.messages = [];
    // get previous username if login failed
    const oldUser = req.session.loginForm?.username;
    delete req.session.loginForm;

    res.render("index", {
        main: "login",
        styles: ["login"],
        loginError: error,
        oldUser: oldUser,
    });
}

const loginController = {
    loginGet,
};

export default loginController;
