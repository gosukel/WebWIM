import userQueries from "../../models/db/users.js";
import WarehouseError from "../../errors/WarehouseError.js";

async function checkUser(id, fullname) {
    if (fullname === "" || id === "") {
        throw new WarehouseError("UserError", "Invalid User Information");
    }

    let idNum = Number(id);
    if (!idNum) {
        throw new WarehouseError("UserError", "Invalid User ID");
    }
    let existingUser = await userQueries.userQueryExact({ id: idNum });
    if (!existingUser) {
        throw new WarehouseError("UserError", "User ID Error");
    }
    if (existingUser.fullName !== fullname) {
        throw new WarehouseError("UserError", "Invalid ID/Name Combination");
    }
    return idNum;
}

async function validateDelUser(req, res, next) {
    const delUser = {
        id: await checkUser(req.body["id"], req.body["fullname"]),
    };
    req.delUser = delUser;
    next();
}

export default validateDelUser;
