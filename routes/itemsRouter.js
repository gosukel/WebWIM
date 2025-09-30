import { Router } from "express";
import itemsController from "../controllers/itemsController.js";

const itemsRouter = Router();

itemsRouter.get("/", itemsController.itemsGet);
itemsRouter.post("/new", itemsController.itemsAdd);
itemsRouter.post("/edit", itemsController.itemsEdit);

// api
itemsRouter.get("/query", itemsController.itemsQuery);

export default itemsRouter;
