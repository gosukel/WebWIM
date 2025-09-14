import { Router } from "express";
import indexController from "../controllers/index.js";
const indexRouter = Router();

// indexRouter.post("/", indexController.indexPost);
indexRouter.get("/", indexController.indexGet);

export default indexRouter;
