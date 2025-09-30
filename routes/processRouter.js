import { Router } from "express";
import processController from "../controllers/processController.js";

const processRouter = Router();

processRouter.get("/", processController.processGet);

// api
processRouter.get("/query", processController.itemsQuery);

export default processRouter;
