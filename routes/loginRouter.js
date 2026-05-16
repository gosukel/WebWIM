import { Router } from "express";
import passport from "passport";
import loginController from "../controllers/loginController.js";
import WarehouseError from "../errors/WarehouseError.js";
const loginRouter = Router();

loginRouter.post(
    "/",
    (req, res, next) => {
        req.session.loginForm = {
            username: req.body.username,
        };
        next();
    },
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
        failureMessage: true,
    })
);
loginRouter.get("/", loginController.loginGet);

loginRouter.use((err, req, res, next) => {
    if (err instanceof WarehouseError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default loginRouter;
