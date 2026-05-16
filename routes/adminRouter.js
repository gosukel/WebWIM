import { Router } from "express";
import adminController from "../controllers/adminController.js";
import userValidator from "../middleware/users/userValidator.js";
import WarehouseError from "../errors/WarehouseError.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { isAdmin } from "../middleware/authMiddleware.js";
const adminRouter = Router();

// authorization middleware
adminRouter.use(isAdmin);

// get
adminRouter.get("/", adminController.adminGet);

//           api
// -notes
adminRouter.get("/notes/query", adminController.notesQuery);
// -users
adminRouter.get("/users/query", adminController.usersQuery);
adminRouter.get("/users/queryExact", adminController.usersQueryExact);
adminRouter.post(
    "/users/new",
    asyncWrapper(userValidator.add),
    asyncWrapper(adminController.usersAdd),
);
adminRouter.post(
    "/users/delete",
    asyncWrapper(userValidator.delete),
    asyncWrapper(adminController.usersDelete),
);
adminRouter.post(
    "/users/edit",
    asyncWrapper(userValidator.edit),
    asyncWrapper(adminController.usersEdit),
);

// // error handler
adminRouter.use((err, req, res, next) => {
    if (err instanceof WarehouseError) {
        console.log("error trigger");
        return res.status(err.statusCode).json({ error: err.message });
    }
});

export default adminRouter;
