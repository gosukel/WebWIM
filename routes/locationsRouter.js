import { Router } from "express";
import locationsController from "../controllers/locationsController.js";
import locationValidator from "../middleware/locations/locationValidator.js";
import WarehouseError from "../errors/WarehouseError.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const locationsRouter = Router();

// get
locationsRouter.get("/", locationsController.locationsGet);

// post
//     new location
locationsRouter.post(
    "/new",
    isAdmin,
    asyncWrapper(locationValidator.add),
    asyncWrapper(locationsController.locationsAdd)
);
//     edit item
locationsRouter.post(
    "/edit",
    isAdmin,
    asyncWrapper(locationValidator.edit),
    asyncWrapper(locationsController.locationsEdit)
);

//     delete location
locationsRouter.post(
    "/delete",
    isAdmin,
    asyncWrapper(locationValidator.delete),
    locationsController.locationsDelete
);

// api
locationsRouter.get("/query", locationsController.locationsQuery);
locationsRouter.get("/notes", locationsController.locationNotesQuery);

// error handler
locationsRouter.use((err, req, res, next) => {
    if (err instanceof WarehouseError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default locationsRouter;
