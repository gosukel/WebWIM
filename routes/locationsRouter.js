import { Router } from "express";
import locationsController from "../controllers/locationsController.js";
import validateNewLocation from "../middleware/newLocationValidator.js";
import validateEditLocation from "../middleware/editLocationValidator.js";
// import LocationError from "../errors/LocationError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const locationsRouter = Router();

// get
locationsRouter.get("/", locationsController.locationsGet);

// post
//     new item
// locationsRouter.post(
//     "/new",
//     asyncWrapper(validateNewLocation),
//     asyncWrapper(locationsController.locationsAdd)
// );
//     edit item
// locationsRouter.post(
//     "/edit",
//     asyncWrapper(validateEditLocation),
//     asyncWrapper(locationsController.locationsEdit)
// );

// api
// locationsRouter.get("/query", locationsController.locationsQuery);

// locationsRouter.use((err, req, res, next) => {
//     if (err instanceof LocationError) {
//         return res.status(err.statusCode).json({ error: err.message });
//     }
// });

export default locationsRouter;
