import locationQueries from "../../models/db/locations.js";
import WarehouseError from "../../errors/WarehouseError.js";

function nameZoneCheck(name, zone) {
    if (name.slice(0, zone.length) !== zone) {
        console.log("error triggered");
        throw new WarehouseError(
            "Location Error",
            `Location NAME must begin with ${zone}`
        );
    }
}

async function checkLocationName(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location NAME required");
    }
    const locName = value.toUpperCase();
    const doesExist = await locationQueries.locationQueryExact({
        type: "name",
        value: locName,
    });
    if (doesExist) {
        throw new WarehouseError(
            "Location Error",
            "Location NAME already exists"
        );
    }

    return locName;
}

async function checkLocationUtn(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location UTN required");
    }
    let locationNumberString = value;
    if (!Number(locationNumberString)) {
        throw new WarehouseError(
            "Location Error",
            "Location UTN not valid number"
        );
    }
    const locUtnExists = await locationQueries.locationQueryExact({
        type: "utn",
        value: locationNumberString,
    });
    if (locUtnExists) {
        throw new WarehouseError(
            "Location Error",
            "Location UTN already exists"
        );
    }
    return locationNumberString;
}

async function checkLocationZone(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location ZONE required");
    }
    const locZone = value.toUpperCase();
    const locZoneExists = await locationQueries.locationQueryExact({
        type: "zone",
        value: locZone,
    });
    if (!locZoneExists) {
        throw new WarehouseError(
            "Location Error",
            "Location ZONE does not exist"
        );
    }
    return locZone;
}

async function getWarehouseIndex(value) {
    if (value === "") {
        throw new WarehouseError(
            "Location Error",
            "Location COMES AFTER required"
        );
    }
    const prevIndex = Number(value);
    if (prevIndex === null || prevIndex === undefined || prevIndex < 0) {
        throw new WarehouseError(
            "Location Error",
            "Invalid value for Location COMES AFTER"
        );
    }
    const warIndexExists = await locationQueries.locationQueryExact({
        type: "warehouseIndex",
        value: prevIndex,
    });
    if (!warIndexExists) {
        throw new WarehouseError(
            "Location Error",
            "Location COMES AFTER does not exist"
        );
    }
    return prevIndex + 1;
}

async function validateNewLocation(req, res, next) {
    const newLocation = {
        name: await checkLocationName(req.body["loc-name"]),
        utn: await checkLocationUtn(req.body["loc-utn"]),
        zone: await checkLocationZone(req.body["loc-zone"]),
        warehouseIndex: await getWarehouseIndex(req.body["loc-prev"]),
    };
    nameZoneCheck(newLocation.name, newLocation.zone);
    req.newLocation = newLocation;
    next();
}

export default validateNewLocation;
