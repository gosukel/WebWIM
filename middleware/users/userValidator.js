import validateNewUser from "./newUserValidator.js";
import validateDelUser from "./deleteUserValidator.js";
import validateEditUser from "./editUserValidator.js";

const userValidator = {
    add: validateNewUser,
    edit: validateEditUser,
    delete: validateDelUser,
};
export default userValidator;
