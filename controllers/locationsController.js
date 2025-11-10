import locationQueries from "../models/db/locations.js";

const user = "Richard Routh";

async function locationsGet(req, res) {
    const locations = await locationQueries.locationQuery();
    const zones = await locationQueries.getAllZones();
    return res.render("index", {
        fullName: user,
        main: "locations",
        styles: ["locations"],
        locations,
        zones,
    });
}

async function locationsQuery(req, res) {
    const search = req.query.search || "";
    const sortParam = req.query.sortParams || "";
    const sortDirection = req.query.sortDirection || "";
    const filters = search.split(" ").filter(Boolean);
    let locations = await locationQueries.locationQuery(
        filters,
        sortParam,
        sortDirection
    );
    return res.json(locations);
}

async function locationsAdd(req, res) {
    const newLocation = req.newLocation;
    try {
        await locationQueries.addLocation(newLocation);
        return res
            .status(201)
            .json({ success: "Location Added Successfully! " });
    } catch {
        return res.status(400).json({ message: "error adding location" });
    }
}

async function locationsDelete(req, res) {
    const deleteLocation = req.deleteLocation;
    try {
        await locationQueries.deleteLocation(deleteLocation);
        return res
            .status(201)
            .json({ success: "Location Deleted Sueccfully!" });
    } catch {
        return res.status(400).json({ message: "error deleting location" });
    }
}

async function locationsEdit(req, res) {
    const editLocation = req.editLocation;
    try {
        await locationQueries.editLocation(editLocation);
        return res.status(201).json({ success: "Edit Successful!" });
    } catch {
        return res.status(400).json({ message: "error adding item" });
    }
}

const locationsController = {
    locationsGet,
    locationsQuery,
    locationsAdd,
    locationsDelete,
    locationsEdit,
};

export default locationsController;
