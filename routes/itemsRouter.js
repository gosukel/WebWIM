import { Router } from "express";
import itemsController from "../controllers/itemsController.js";
import validateNewItem from "../middleware/newItemValidator.js";
import validateEditItem from "../middleware/editItemValidator.js";
import ItemError from "../errors/ItemError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const itemsRouter = Router();

// get
itemsRouter.get("/", itemsController.itemsGet);

// post
//     new item
itemsRouter.post(
    "/new",
    asyncWrapper(validateNewItem),
    asyncWrapper(itemsController.itemsAdd)
);
//     edit item
itemsRouter.post(
    "/edit",
    asyncWrapper(validateEditItem),
    asyncWrapper(itemsController.itemsEdit)
);

// api
itemsRouter.get("/query", itemsController.itemsQuery);

itemsRouter.use((err, req, res, next) => {
    if (err instanceof ItemError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default itemsRouter;
