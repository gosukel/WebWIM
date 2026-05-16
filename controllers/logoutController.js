async function logoutGet(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        res.redirect("/");
    });
}

const logoutController = {
    logoutGet,
};

export default logoutController;
