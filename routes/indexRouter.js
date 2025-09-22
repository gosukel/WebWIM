import { Router } from "express";
import indexController from "../controllers/index.js";
const indexRouter = Router();

// indexRouter.post("/", indexController.indexPost);
indexRouter.get("/", indexController.indexGet);
indexRouter.get("/calculate", indexController.calculateGet);
indexRouter.get("/process", indexController.processGet);
indexRouter.get("/items", indexController.itemsGet);
export default indexRouter;
