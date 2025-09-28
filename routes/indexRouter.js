import { Router } from "express";
import indexController from "../controllers/index.js";
const indexRouter = Router();

indexRouter.get("/", indexController.indexGet);
indexRouter.get("/calculate", indexController.calculateGet);
indexRouter.get("/process", indexController.processGet);
// items
indexRouter.get("/items", indexController.itemsGet);
indexRouter.post("/items/new", indexController.itemsAdd);
indexRouter.post("/items/edit", indexController.itemsEdit);

// api calls
indexRouter.get("/items/query", indexController.itemsQuery);
indexRouter.get("/items/sort", indexController.itemsSort);
export default indexRouter;
