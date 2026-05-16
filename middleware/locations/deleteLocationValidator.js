import locationQueries from "../../models/db/locations.js";
import WarehouseError from "../../errors/WarehouseError.js";

async function checkLocationId(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "No Location ID");
    }
    let idNum = Number(value);
    if (!idNum) {
        throw new WarehouseError("Location Error", "Invalid Location ID");
    }
    return idNum;
}

async function checkLocationName(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location NAME required");
    }
    const locationName = value.toUpperCase();

    const doesExist = await locationQueries.locationQueryExact({
        type: "name",
        value: locationName,
    });

    if (!doesExist) {
        throw new WarehouseError(
            "Location Error",
            `Location ${locationName} does not exist`
        );
    }
    return locationName;
}

async function getWarehouseIndex(value) {
    const locId = Number(value);
    const locInfo = await locationQueries.locationQueryExact({
        type: "id",
        value: locId,
    });
    if (!locInfo) {
        throw new WarehouseError(
            "Location Error",
            `Location ID ${locId} does not exist`
        );
    }
    return locInfo.warehouseIndex;
}

async function validateDelLocation(req, res, next) {
    const deleteLocation = {
        id: await checkLocationId(req.body["id"]),
        name: await checkLocationName(req.body["name"]),
        warehouseIndex: await getWarehouseIndex(req.body["id"]),
    };
    req.deleteLocation = deleteLocation;
    next();
}

export default validateDelLocation;
