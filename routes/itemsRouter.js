import { Router } from "express";
import itemsController from "../controllers/itemsController.js";
import testValidateNewItem from "../middleware/customValidators.js";
import ItemAddError from "../errors/ItemAddError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const itemsRouter = Router();

// get
itemsRouter.get("/", itemsController.itemsGet);

// post
itemsRouter.post(
    "/new",
    asyncWrapper(testValidateNewItem),
    asyncWrapper(itemsController.itemsAdd)
);
itemsRouter.post("/edit", itemsController.itemsEdit);

// api
itemsRouter.get("/query", itemsController.itemsQuery);

itemsRouter.use((err, req, res, next) => {
    if (err instanceof ItemAddError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default itemsRouter;
