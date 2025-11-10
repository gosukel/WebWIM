import { Router } from "express";
import itemsController from "../controllers/itemsController.js";
import itemValidator from "../middleware/items/itemValidator.js";
import ItemError from "../errors/ItemError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const itemsRouter = Router();

// get
itemsRouter.get("/", itemsController.itemsGet);

// post
//     new item
itemsRouter.post(
    "/new",
    asyncWrapper(itemValidator.add),
    asyncWrapper(itemsController.itemsAdd)
);
//     edit item
itemsRouter.post(
    "/edit",
    asyncWrapper(itemValidator.edit),
    asyncWrapper(itemsController.itemsEdit)
);
//     delete item
itemsRouter.post(
    "/delete",
    asyncWrapper(itemValidator.delete),
    itemsController.itemsDelete
);

// api
itemsRouter.get("/query", itemsController.itemsQuery);
itemsRouter.get("/notes", itemsController.itemNotesQuery);

// error handler
itemsRouter.use((err, req, res, next) => {
    if (err instanceof ItemError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default itemsRouter;
