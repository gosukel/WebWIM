import validateNewItem from "./newItemValidator.js";
import validateEditItem from "./editItemValidator.js";
import validateDelItem from "./deleteItemValidator.js";

const itemValidator = {
    add: validateNewItem,
    edit: validateEditItem,
    delete: validateDelItem,
};

export default itemValidator;
