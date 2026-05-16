import { Router } from "express";
import passport from "passport";
import logoutController from "../controllers/logoutController.js";
import WarehouseError from "../errors/WarehouseError.js";
const logoutRouter = Router();

logoutRouter.get("/", logoutController.logoutGet);

logoutRouter.use((err, req, res, next) => {
    if (err instanceof WarehouseError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});
export default logoutRouter;
