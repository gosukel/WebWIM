import { Router } from "express";
import locationsController from "../controllers/locationsController.js";
import locationValidator from "../middleware/locations/locationValidator.js";
import LocationError from "../errors/LocationError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const locationsRouter = Router();

// get
locationsRouter.get("/", locationsController.locationsGet);

// post
//     new location
locationsRouter.post(
    "/new",
    asyncWrapper(locationValidator.add),
    asyncWrapper(locationsController.locationsAdd)
);
//     edit item
locationsRouter.post(
    "/edit",
    asyncWrapper(locationValidator.edit),
    asyncWrapper(locationsController.locationsEdit)
);

//     delete location
locationsRouter.post(
    "/delete",
    asyncWrapper(locationValidator.delete),
    locationsController.locationsDelete
);

// api
locationsRouter.get("/query", locationsController.locationsQuery);

// error handler
locationsRouter.use((err, req, res, next) => {
    if (err instanceof LocationError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default locationsRouter;
