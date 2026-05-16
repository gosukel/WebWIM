import WarehouseError from "../errors/WarehouseError.js";
function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

function isAdmin(req, res, next) {
    if (req.user.role === "ADMIN") {
        return next();
    } else {
        return res.redirect("/").json({ message: "Not Authorized" });
    }
}

export { isAuth, isAdmin };
