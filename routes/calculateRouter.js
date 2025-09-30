import { Router } from "express";
import calculateController from "../controllers/calculateController.js";
const calculateRouter = Router();

calculateRouter.get("/", calculateController.calculateGet);

export default calculateRouter;
