import { Router } from "express";
import loginController from "../controllers/login.js";
const loginRouter = Router();

loginRouter.post("/", loginController.loginPost);
loginRouter.get("/", loginController.loginGet);

export default loginRouter;
