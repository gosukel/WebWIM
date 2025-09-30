import { Router } from "express";
import indexController from "../controllers/indexController.js";

const indexRouter = Router();

indexRouter.get("/", indexController.indexGet);

// items
// indexRouter.get("/items", indexController.itemsGet);
// indexRouter.post("/items/new", validateNewItem, indexController.itemsAdd);
// indexRouter.post("/items/edit", indexController.itemsEdit);

// api calls
// indexRouter.get("/items/query", indexController.itemsQuery);
// indexRouter.get("/items/sort", indexController.itemsSort);
// indexRouter.get("/items/brands", indexController.itemsBrands);
// indexRouter.get("/items/types", indexController.itemsTypes);
// indexRouter.get("/process/query", indexController.itemsQuery);
export default indexRouter;
