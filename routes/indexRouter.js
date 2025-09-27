import { Router } from "express";
import indexController from "../controllers/index.js";
const indexRouter = Router();

// indexRouter.post("/", indexController.indexPost);
indexRouter.get("/", indexController.indexGet);
indexRouter.get("/calculate", indexController.calculateGet);
indexRouter.get("/process", indexController.processGet);
indexRouter.get("/items", indexController.itemsGet);

// api calls
indexRouter.get("/items/query", indexController.itemQuery);
indexRouter.get("/items/sort", indexController.itemSort);
export default indexRouter;
