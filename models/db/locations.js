import prisma from "./client.js";
// location - zone - utn - items
async function locationQuery(filters = [], sort = "", direction = "") {
    const where =
        filters.length > 0
            ? {
                  AND: filters.map((term) => ({
                      OR: [
                          {
                              name: {
                                  contains: term,
                                  mode: "insensitive",
                              },
                          },
                          {
                              utn: {
                                  contains: term,
                                  mode: "insensitive",
                              },
                          },
                          {
                              zone: {
                                  contains: term,
                                  mode: "insensitive",
                              },
                          },
                          {
                              // item: item - type - brand -
                              items: {
                                  some: {
                                      item: {
                                          OR: [
                                              {
                                                  name: {
                                                      contains: term,
                                                      mode: "insensitive",
                                                  },
                                              },
                                              {
                                                  type: {
                                                      contains: term,
                                                      mode: "insensitive",
                                                  },
                                              },
                                              {
                                                  brand: {
                                                      contains: term,
                                                      mode: "insensitive",
                                                  },
                                              },
                                          ],
                                      },
                                  },
                              },
                          },
                      ],
                  })),
              }
            : {};

    const orderBy =
        sort != "" && sort != "items" && direction != ""
            ? { [sort]: direction }
            : { warehouseIndex: "asc" };

    const locations = await prisma.location.findMany({
        where,
        orderBy,
        include: {
            items: {
                select: {
                    item: true,
                },
            },
        },
    });

    // special sort for items
    if (sort === "items") {
        let sortedLocations;
        const dir = direction === "asc" ? 1 : -1;
        sortedLocations = locations.toSorted((a, b) => {
            const itemA = a.items[0]?.item?.name ?? "zzz";
            const itemB = b.items[0]?.item?.name ?? "zzz";
            return dir * itemA.localeCompare(itemB);
        });
        return sortedLocations;
    }

    return locations;
}

async function getAllZones() {
    const zones = await prisma.location.findMany({
        select: {
            zone: true,
        },
        distinct: ["zone"],
    });
    let zoneList = zones.map((loc) => loc.zone);
    return zoneList;
}

async function locationQueryExact({ type, value, id = null }) {
    let where;
    if (id && (type === "name" || type === "utn")) {
        where = {
            [type]: value,
            id: { not: id },
        };
    } else {
        where = {
            [type]: value,
        };
    }
    const exactMatch = await prisma.location.findFirst({
        where,
    });
    return exactMatch;
}

async function addLocation(loc) {
    let newLocation = await prisma.$transaction(async (tx) => {
        const numLocsUpdated = await tx.location.updateMany({
            where: {
                warehouseIndex: {
                    gte: loc.warehouseIndex,
                },
            },
            data: {
                warehouseIndex: {
                    increment: 1,
                },
            },
        });

        const txNewLocation = await tx.location.create({
            data: {
                name: loc.name,
                utn: loc.utn,
                zone: loc.zone,
                warehouseIndex: loc.warehouseIndex,
            },
        });

        const log_id = crypto.randomUUID();
        const newLocationNote = await tx.note.create({
            data: {
                entityType: "location",
                entityId: txNewLocation.id,
                logId: log_id,
                userId: 1,
                message: `Location Created - ${txNewLocation.name}`,
            },
        });
        return txNewLocation;
    });
    return newLocation;
}

async function deleteLocation(loc) {
    const log_id = crypto.randomUUID();
    return await prisma.$transaction(async (tx) => {
        // remove item-location relation
        const deletedRelations = await tx.itemLocation.deleteMany({
            where: {
                locationId: loc.id,
            },
        });
        // shift warehouseIndex
        const numLocsUpdated = await tx.location.updateMany({
            where: {
                warehouseIndex: {
                    gt: loc.warehouseIndex,
                },
            },
            data: {
                warehouseIndex: {
                    decrement: 1,
                },
            },
        });
        // delete location
        const deletedLocation = await tx.location.delete({
            where: { id: loc.id },
        });
        // add note
        const delNote = await tx.note.create({
            data: {
                entityType: "location",
                entityId: loc.id,
                logId: log_id,
                userId: 1,
                message: `Location Deleted - ${loc.name}`,
            },
        });
    });
}

async function locationItemQueryExact(q) {
    const item = await prisma.item.findFirst({
        select: {
            id: true,
            name: true,
        },
        where: {
            name: q,
        },
    });
    return item;
}

async function updateLocationWithItems(
    curLocation,
    locId,
    update,
    connect,
    disconnect,
    changes
) {
    return await prisma.$transaction(async (tx) => {
        // update any changes on location record
        if (update.status) {
            // check for warehouseIndex change
            if (update.data.warehouseIndex) {
                let updatedIndices;
                // check for positive change (NEW INDEX HIGHER THAN CURRENT INDEX)
                if (update.data.warehouseIndex > curLocation.warehouseIndex) {
                    updatedIndices = await tx.location.updateManyAndReturn({
                        where: {
                            AND: [
                                {
                                    warehouseIndex: {
                                        gt: curLocation.warehouseIndex,
                                    },
                                },
                                {
                                    warehouseIndex: {
                                        lte: update.data.warehouseIndex,
                                    },
                                },
                                {
                                    id: {
                                        not: locId,
                                    },
                                },
                            ],
                        },
                        data: {
                            warehouseIndex: { decrement: 1 },
                        },
                    });
                } else if (
                    // check for negative change
                    update.data.warehouseIndex < curLocation.warehouseIndex
                ) {
                    updatedIndices = await tx.location.updateManyAndReturn({
                        where: {
                            AND: [
                                {
                                    warehouseIndex: {
                                        gte: update.data.warehouseIndex,
                                    },
                                },
                                {
                                    warehouseIndex: {
                                        lt: curLocation.warehouseIndex,
                                    },
                                },
                                {
                                    id: { not: locId },
                                },
                            ],
                        },
                        data: {
                            warehouseIndex: { increment: 1 },
                        },
                    });
                }
                // add notes for all shifted locations
                updatedIndices.forEach((loc) => {
                    changes.push({
                        entityType: "location",
                        entityId: loc.id,
                        logId: update.log_id,
                        userId: 1,
                        message: `WAREHOUSEINDEX shift to ${loc.warehouseIndex}`,
                    });
                });
            }
            // apply changes for location
            const updatedLocation = await tx.location.update({
                where: { id: locId },
                data: update.data,
            });
        }

        // disconnect items
        if (disconnect.status && disconnect.ids.length > 0) {
            await tx.itemLocation.deleteMany({
                where: {
                    locationId: locId,
                    itemId: { in: disconnect.ids },
                },
            });
        }

        // connect items
        if (connect.status && connect.ids.length > 0) {
            const newRelations = connect.ids.map((itemId) => ({
                itemId,
                locationId: locId,
            }));
            await tx.itemLocation.createMany({
                data: newRelations,
                skipDuplicates: true,
            });
        }

        // add notes
        if (changes.length > 0) {
            await tx.note.createMany({
                data: changes,
            });
        }
    });
}

async function editLocation(location) {
    // get current location details
    const curLocation = await prisma.location.findFirst({
        where: {
            id: location.id,
        },
        include: {
            items: {
                select: {
                    item: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    // prep obj variabls
    const log_id = crypto.randomUUID();
    let update = {
        status: false,
        data: {},
        log_id: log_id,
    };
    let disconnect = {
        status: false,
        ids: [],
    };
    let connect = {
        status: false,
        ids: [],
    };
    let changeList = [];
    // check for values that changed, assign to data obj
    for (const prop in curLocation) {
        // ignored value
        if (prop === "warehouseId") {
            continue;
        }

        // special items check
        if (prop === "items") {
            // no old items, no new items - NO CHANGE
            if (curLocation[prop].length === 0 && location[prop].length === 0) {
                continue;
            }

            // no old items, new items - CONNECT ALL
            if (curLocation[prop].length === 0 && location[prop].length > 0) {
                connect.status = true;
                location[prop].forEach((item) => {
                    connect.ids.push(item.id);
                    changeList.push({
                        entityType: "location",
                        entityId: location.id,
                        logId: log_id,
                        userId: 1,
                        message: `ITEM added ${item.name}`,
                    });
                    changeList.push({
                        entityType: "item",
                        entityId: item.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION added ${location.name}`,
                    });
                });
                continue;
            }

            // remove old location(s), no new locations - DISCONNECT ALL
            if (curLocation[prop].length > 0 && location[prop].length === 0) {
                disconnect.status = true;
                curLocation[prop].forEach((item) => {
                    disconnect.ids.push(item.item.id);
                    changeList.push({
                        entityType: "location",
                        entityId: location.id,
                        logId: log_id,
                        userId: 1,
                        message: `ITEM removed ${item.item.name}`,
                    });
                    changeList.push({
                        entityType: "item",
                        entityId: item.item.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION removed ${location.name}`,
                    });
                });
                continue;
            }

            // SOME CHANGES NEEDED
            // check new ids vs old ids
            let curItemObj = {};
            curLocation[prop].forEach((item) => {
                curItemObj[item.item.id] = {
                    id: item.item.id,
                    name: item.item.name,
                };
            });
            let newItemObj = {};
            location[prop].forEach((item) => {
                newItemObj[item.id] = {
                    id: item.id,
                    name: item.name,
                };
            });
            // check for items being removed (curItems NOT IN newItems)
            for (let curItem of curLocation[prop]) {
                if (!newItemObj[curItem.item.id]) {
                    disconnect.status = true;
                    disconnect.ids.push(curItem.item.id);
                    changeList.push({
                        entityType: "location",
                        entityId: location.id,
                        logId: log_id,
                        userId: 1,
                        message: `ITEM removed ${curItem.item.name}`,
                    });
                    changeList.push({
                        entityType: "item",
                        entityId: curItem.item.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION removed ${location.name}`,
                    });
                }
            }
            // check for items being added (newItems NOT IN curItems)
            for (let newItem of location[prop]) {
                if (!curItemObj[newItem.id]) {
                    connect.status = true;
                    connect.ids.push(newItem.id);
                    changeList.push({
                        entityType: "location",
                        entityId: location.id,
                        logId: log_id,
                        userId: 1,
                        message: `ITEM added ${newItem.name}`,
                    });
                    changeList.push({
                        entityType: "item",
                        entityId: newItem.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION added ${location.name}`,
                    });
                }
            }
            continue;
        }

        if (curLocation[prop] != location[prop]) {
            if (!update.status) {
                update.status = true;
            }
            update.data[prop] = location[prop];
            changeList.push({
                entityType: "location",
                entityId: location.id,
                logId: log_id,
                userId: 1,
                message: `${prop.toUpperCase()} from ${curLocation[prop]} to ${location[prop]}`,
            });
        }
    }

    await updateLocationWithItems(
        curLocation,
        location.id,
        update,
        connect,
        disconnect,
        changeList
    );
    return;
}

const locationQueries = {
    locationQuery,
    getAllZones,
    locationQueryExact,
    locationItemQueryExact,
    addLocation,
    deleteLocation,
    editLocation,
};

export default locationQueries;
