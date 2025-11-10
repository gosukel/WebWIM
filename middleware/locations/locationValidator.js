import validateDelLocation from "./deleteLocationValidator.js";
import validateNewLocation from "./addLocationValidator.js";
import validateEditLocation from "./editLocationValidator.js";

const locationValidator = {
    add: validateNewLocation,
    edit: validateEditLocation,
    delete: validateDelLocation,
};

export default locationValidator;
