import { Router } from "express";
import itemsController from "../controllers/itemsController.js";
import itemValidator from "../middleware/items/itemValidator.js";
import WarehouseError from "../errors/WarehouseError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { isAdmin } from "../middleware/authMiddleware.js";
const itemsRouter = Router();

// get
itemsRouter.get("/", itemsController.itemsGet);

// post
//     new item
itemsRouter.post(
    "/new",
    isAdmin,
    asyncWrapper(itemValidator.add),
    asyncWrapper(itemsController.itemsAdd)
);
//     edit item
itemsRouter.post(
    "/edit",
    isAdmin,
    asyncWrapper(itemValidator.edit),
    asyncWrapper(itemsController.itemsEdit)
);
//     delete item
itemsRouter.post(
    "/delete",
    isAdmin,
    asyncWrapper(itemValidator.delete),
    itemsController.itemsDelete
);

// api
itemsRouter.get("/query", itemsController.itemsQuery);
itemsRouter.get("/notes", itemsController.itemNotesQuery);

// error handler
itemsRouter.use((err, req, res, next) => {
    if (err instanceof WarehouseError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default itemsRouter;
