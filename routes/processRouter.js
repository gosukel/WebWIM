import { Router } from "express";
import processController from "../controllers/processController.js";
import processValidator from "../middleware/process/processValidator.js";
import ProcessError from "../errors/ProcessError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const processRouter = Router();

// get
processRouter.get("/", processController.processGet);

// post
//      new order
processRouter.post(
    "/new",
    asyncWrapper(processValidator.add),
    asyncWrapper(processController.processAdd)
);

// api
processRouter.get("/query", processController.orderQuery);

// error handler
processRouter.use((err, req, res, next) => {
    if (err instanceof ProcessError) {
        console.log("error handler triggered");
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default processRouter;
