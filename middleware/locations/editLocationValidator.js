import locationQueries from "../../models/db/locations.js";
import WarehouseError from "../../errors/WarehouseError.js";

// loc name
async function checkLocationName(value, id) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location NAME required");
    }
    const locName = value.toUpperCase();
    const nameExists = await locationQueries.locationQueryExact({
        type: "name",
        value: locName,
        id: id,
    });

    if (nameExists) {
        throw new WarehouseError(
            "Location Error",
            "Location NAME already exists"
        );
    }
    return locName;
}
// loc utn
async function checkLocationUtn(value, id) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location UTN required");
    }
    let utnString = value;
    if (!Number(utnString)) {
        throw new WarehouseError(
            "Location Error",
            "Location UTN not a valid number"
        );
    }

    const utnExists = await locationQueries.locationQueryExact({
        type: "utn",
        value: utnString,
        id: id,
    });

    if (utnExists) {
        throw new WarehouseError(
            "Location Error",
            "Location UTN already exists"
        );
    }
    return utnString;
}
// loc zone
async function checkLocationZone(value) {
    if (value === "") {
        throw new WarehouseError("Location Error", "Location ZONE required");
    }
    const locZone = value.toUpperCase();
    const zoneExists = await locationQueries.locationQueryExact({
        type: "zone",
        value: locZone,
    });
    if (!zoneExists) {
        throw new WarehouseError(
            "Location Error",
            "Location ZONE must already exist"
        );
    }
    return locZone;
}
// loc prev
async function getWarehouseIndex(value, id) {
    if (value === "") {
        throw new WarehouseError(
            "Location Error",
            "Location COMES AFTER required"
        );
    }
    let currentLocation = await locationQueries.locationQueryExact({
        type: "id",
        value: id,
    });
    let prevIndex = Number(value);
    if (
        typeof prevIndex !== "number" ||
        Number.isNaN(prevIndex) ||
        prevIndex < -1
    ) {
        throw new WarehouseError(
            "Location Error",
            "Invalid value for COMES AFTER"
        );
    }
    if (prevIndex > currentLocation.warehouseIndex) {
        return prevIndex;
    }
    return prevIndex + 1;
}
// loc items
async function checkLocationItems(values, id) {
    let itemList = values.split("\n");
    let itemIds = [];
    let itemsInfo = [];
    for (const item of itemList) {
        if (!item) {
            continue;
        }
        let itemInfo = await locationQueries.locationItemQueryExact(
            item.toUpperCase()
        );
        if (!itemInfo) {
            throw new WarehouseError(
                "Item Error",
                `Item ${item.toUpperCase()} does not exist`
            );
        }
        // check for duplicate items being added
        if (!itemIds.includes(itemInfo.id)) {
            itemIds.push(itemInfo.id);
            itemsInfo.push(itemInfo);
        }
    }

    return itemsInfo;
}

async function validateEditLocation(req, res, next) {
    let locId = Number(req.body["loc-id"]);
    const editLoc = {
        id: locId,
        name: await checkLocationName(req.body["loc-name"], locId),
        utn: await checkLocationUtn(req.body["loc-utn"], locId),
        zone: await checkLocationZone(req.body["loc-zone"]),
        warehouseIndex: await getWarehouseIndex(req.body["loc-prev"], locId),
        items: await checkLocationItems(req.body["loc-items"]),
    };
    req.editLocation = editLoc;
    next();
}

export default validateEditLocation;
