import locationQueries from "../../models/db/locations.js";
import itemQueries from "../../models/db/items.js";
import LocationError from "../../errors/LocationError.js";

function nameZoneCheck(name, zone) {
    if (zone === "EQ") {
        if (name.slice(0, 2) !== "EQ") {
            throw new LocationError("Location NAME must begin with EQ");
        }
    }
    if (zone === "DOCK") {
        if (name.slice(0, 4) !== "DOCK") {
            throw new LocationError("Location NAME must begin with DOCK");
        }
    }
    if (zone === "WALL") {
        if (name.slice(0, 4) !== "WALL") {
            throw new LocationError("Location NAME must begin with WALL");
        }
    }
    if (zone === "LNS") {
        if (name.slice(0, 3) !== "LNS") {
            throw new LocationError("Location NAME must begin with LNS");
        }
    }
    if (zone === "ACC") {
        if (name.slice(0, 3) !== "ACC") {
            throw new LocationError("Location NAME must begin with ACC");
        }
    }
    if (zone === "PIT") {
        if (name.slice(0, 3) !== "PIT") {
            throw new LocationError("Location NAME must begin with PIT");
        }
    }
}

async function checkLocationName(value) {
    if (value === "") {
        throw new LocationError("Location NAME required");
    }
    const locName = value.toUpperCase();
    const doesExist = await locationQueries.locationQueryExact({
        type: "name",
        value: locName,
    });
    if (doesExist) {
        throw new LocationError("Location NAME already exists");
    }
    return locName;
}

async function checkLocationUtn(value) {
    if (value === "") {
        throw new LocationError("Location UTN required");
    }
    let locationNumberString = value;
    if (!Number(locationNumberString)) {
        throw new LocationError("Location UTN not valid number");
    }
    const locUtnExists = await locationQueries.locationQueryExact({
        type: "utn",
        value: locationNumberString,
    });
    if (locUtnExists) {
        throw new LocationError("Location UTN already exists");
    }
    return locationNumberString;
}

async function checkLocationZone(value) {
    if (value === "") {
        throw new LocationError("Location ZONE required");
    }
    const locZone = value.toUpperCase();
    const locZoneExists = await locationQueries.locationQueryExact({
        type: "zone",
        value: locZone,
    });
    if (!locZoneExists) {
        throw new LocationError("Location ZONE does not exist");
    }
    return locZone;
}

async function getWarehouseIndex(value) {
    if (value === "") {
        throw new LocationError("Location COMES AFTER required");
    }
    const prevIndex = Number(value);
    if (prevIndex === null || prevIndex === undefined || prevIndex < 0) {
        throw new LocationError("Invalid value for Location COMES AFTER");
    }
    const warIndexExists = await locationQueries.locationQueryExact({
        type: "warehouseIndex",
        value: prevIndex,
    });
    if (!warIndexExists) {
        throw new LocationError("Location COMES AFTER does not exist");
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
