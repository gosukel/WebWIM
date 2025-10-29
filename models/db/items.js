import prisma from "./client.js";

async function getAllBrands() {
    const brands = await prisma.item.findMany({
        select: {
            brand: true,
        },
        distinct: ["brand"],
    });
    let brandList = brands.map((item) => item.brand);
    return brandList;
}

async function getAllTypes() {
    const types = await prisma.item.findMany({
        select: {
            type: true,
        },
        distinct: ["type"],
    });
    let typesList = types.map((item) => item.type);
    return typesList;
}

async function itemQuery(filters = [], sort = "", direction = "") {
    // build filter obj
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
                              number: {
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
                          {
                              locations: {
                                  some: {
                                      location: {
                                          name: {
                                              contains: term,
                                              mode: "insensitive",
                                          },
                                      },
                                  },
                              },
                          },
                      ],
                  })),
              }
            : {};

    // build sorter obj
    const orderBy =
        sort != "" && sort != "locations" && direction != ""
            ? {
                  [sort]: direction,
              }
            : {
                  name: "asc",
              };

    const items = await prisma.item.findMany({
        where,
        orderBy,
        include: {
            locations: {
                select: {
                    location: true,
                    stock: true,
                },
            },
        },
    });

    // special sort for location id
    if (sort === "locations") {
        let sortedItems;
        const dir = direction === "asc" ? 1 : -1;
        sortedItems = items.toSorted((a, b) => {
            const locA = a.locations[0]?.location?.warehouseIndex ?? 10000;
            const locB = b.locations[0]?.location?.warehouseIndex ?? 10000;
            return dir * (locA - locB);
        });
        return sortedItems;
    }
    return items;
}

async function itemQueryExactName(item, id = null) {
    let where;
    if (id) {
        where = {
            name: item,
            id: { not: id },
        };
    } else {
        where = {
            name: item,
        };
    }
    const existingItem = await prisma.item.findFirst({
        where,
    });

    return existingItem;
}

async function itemQueryExactNumber(num, id = null) {
    let where;
    if (id) {
        where = {
            number: num,
            id: { not: id },
        };
    } else {
        where = {
            number: num,
        };
    }
    const existingItem = await prisma.item.findFirst({
        where,
    });
    return existingItem;
}

async function itemQueryExactBrand(brand) {
    const result = await prisma.item.findFirst({
        where: {
            brand: brand,
        },
    });
    return result;
}

async function itemQueryExactType(type) {
    const result = await prisma.item.findFirst({
        where: {
            type: type,
        },
    });
    return result;
}

async function itemQueryExactID(id) {
    const result = await prisma.item.findFirst({
        where: {
            id: id,
        },
    });
    return result;
}

async function itemQueryExact({ type, value, id = null }) {
    let where;
    if (id && (type === "name" || type === "number")) {
        where = {
            [type]: value,
            id: { not: id },
        };
    } else {
        where = {
            [type]: value,
        };
    }
    const exactMatch = await await prisma.item.findFirst({
        where,
    });
    return exactMatch;
}

async function addItem(item) {
    let newItem = await prisma.$transaction(async (tx) => {
        // add new item to generate id
        const txNewItem = await tx.item.create({
            data: {
                name: item.name,
                number: item.number,
                type: item.type,
                brand: item.brand,
                weight: item.weight,
                palletQty: item.pallet,
                locations: {
                    create: item.locations.map((loc) => ({
                        location: { connect: { id: loc.id } },
                    })),
                },
            },
        });
        // create notes
        const itemNotes = [];
        const log_id = crypto.randomUUID();
        // create initial note
        const initialNote = await tx.note.create({
            data: {
                entityType: "item",
                entityId: txNewItem.id,
                logId: log_id,
                userId: 1,
                message: `Item Created - ${item.name}`,
            },
        });
        // create list of notes for item values
        for (const prop in item) {
            if (prop === "stock") {
                continue;
            }
            if (prop === "locations") {
                item[prop].forEach((loc) => {
                    // note for item
                    itemNotes.push({
                        entityType: "item",
                        entityId: txNewItem.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION added ${loc.name}`,
                    });
                    // note for location
                    itemNotes.push({
                        entityType: "location",
                        entityId: loc.id,
                        logId: log_id,
                        userId: 1,
                        message: `ITEM added ${item.name}`,
                    });
                });
                continue;
            }
            itemNotes.push({
                entityType: "item",
                entityId: txNewItem.id,
                logId: log_id,
                userId: 1,
                message: `Item ${prop.toUpperCase()} - ${item[prop]}`,
            });
        }
        // add list of notes
        const newNotes = await tx.note.createMany({
            data: itemNotes,
        });
        return txNewItem;
    });
    return newItem;
}

async function updateItemWithLocations(
    itemId,
    update,
    connect,
    disconnect,
    changes
) {
    return await prisma.$transaction(async (tx) => {
        // update any changes on item record
        if (update.status) {
            const updatedItem = await tx.item.update({
                where: { id: itemId },
                data: update.data,
            });
        }

        // disconnect locations
        if (disconnect.status && disconnect.ids.length > 0) {
            await tx.itemLocation.deleteMany({
                where: {
                    itemId: itemId,
                    locationId: { in: disconnect.ids },
                },
            });
        }

        // connect locations
        if (connect.status && connect.ids.length > 0) {
            const newRelations = connect.ids.map((locId) => ({
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

async function editItem(item) {
    // get current item details
    const curItem = await prisma.item.findFirst({
        where: {
            id: item.id,
        },
        include: {
            locations: {
                select: {
                    location: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    // prep obj variables
    let update = {
        status: false,
        data: {},
        changeList: [],
    };
    let disconnect = {
        status: false,
        ids: [],
        changeList: [],
    };
    let connect = {
        status: false,
        ids: [],
        changeList: [],
    };

    const log_id = crypto.randomUUID();
    // check for values that changed, assign to data obj
    for (const prop in curItem) {
        // ignored values
        if (prop === "stock") {
            continue;
        }

        // special locations check
        if (prop === "locations") {
            // no new location, no old location - NO CHANGE
            if (item[prop].length === 0 && curItem[prop].length === 0) {
                continue;
            }

            // no old location, new location - CONNECT ALL
            if (curItem[prop].length === 0 && item[prop].length > 0) {
                connect.status = true;
                item[prop].forEach((loc) => {
                    connect.ids.push(loc.id);
                    update.changeList.push({
                        entityType: "item",
                        entityId: item.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION added ${loc.name}`,
                    });
                    connect.changeList.push({
                        entityType: "location",
                        entityId: loc.id,
                        message: `ITEM added ${item.name}`,
                        logId: log_id,
                        userId: 1,
                    });
                });
                continue;
            }

            // no new location, remove old locations - DISCONNECT ALL
            if (item[prop].length === 0 && curItem[prop].length > 0) {
                disconnect.status = true;
                curItem[prop].forEach((loc) => {
                    disconnect.ids.push(loc.location.id);
                    update.changeList.push({
                        entityType: "item",
                        entityId: item.id,
                        logId: log_id,
                        userId: 1,
                        message: `LOCATION removed ${loc.location.name}`,
                    });
                    disconnect.changeList.push({
                        entityType: "location",
                        entityId: loc.location.id,
                        message: `ITEM removed ${item.name}`,
                        logId: log_id,
                        userId: 1,
                    });
                });
                continue;
            }

            // check new ids vs old ids
            let curLocObj = {};
            curItem[prop].forEach((loc) => {
                curLocObj[loc.location.id] = {
                    id: loc.location.id,
                    name: loc.location.name,
                };
            });
            let newLocObj = {};
            item[prop].forEach((loc) => {
                newLocObj[loc.id] = {
                    id: loc.id,
                    name: loc.name,
                };
            });
            // check for locations being removed (curLocs NOT IN newLocs)
            for (let curLoc of curItem[prop]) {
                if (!newLocObj[curLoc.location.id]) {
                    disconnect.status = true;
                    disconnect.ids.push(curLoc.location.id);
                    update.changeList.push({
                        entityType: "item",
                        entityId: item.id,
                        logId: log_id,
                        userId: 1,
                        message: `${prop.toUpperCase()} removed ${curLoc.location.name}`,
                    });
                    disconnect.changeList.push({
                        message: `ITEM removed ${item.name}`,
                        entityId: curLoc.location.id,
                        entityType: "location",
                        logId: log_id,
                        userId: 1,
                    });
                }
            }
            // check for locations being added (newLocs NOT IN curLocs)
            for (let newLoc of item[prop]) {
                if (!curLocObj[newLoc.id]) {
                    connect.status = true;
                    connect.ids.push(newLoc.id);
                    update.changeList.push({
                        entityType: "item",
                        entityId: item.id,
                        logId: log_id,
                        userId: 1,
                        message: `${prop.toUpperCase()} added ${newLoc.name}`,
                    });
                    connect.changeList.push({
                        entityType: "location",
                        entityId: newLoc.id,
                        message: `ITEM added ${item.name}`,
                        logId: log_id,
                        userId: 1,
                    });
                }
            }
            continue;
        }

        // all other props
        if (curItem[prop] != item[prop]) {
            if (!update.status) {
                update.status = true;
            }
            update.data[prop] = item[prop];
            update.changeList.push({
                entityType: "item",
                entityId: item.id,
                logId: log_id,
                userId: 1,
                message: `${prop.toUpperCase()} from ${curItem[prop]} to ${item[prop]}`,
            });
        }
    }
    // combine all notes to single list
    let allChanges = [
        ...update.changeList,
        ...connect.changeList,
        ...disconnect.changeList,
    ];

    // run edit query
    await updateItemWithLocations(
        item.id,
        update,
        connect,
        disconnect,
        allChanges
    );
    return;
}

async function deleteItem(id, name) {
    const log_id = crypto.randomUUID();
    return await prisma.$transaction(async (tx) => {
        // remove item-location relation
        const deletedRelations = await tx.itemLocation.deleteMany({
            where: { itemId: id },
        });

        // delete item itself
        const deletedItem = await tx.item.delete({
            where: { id: id },
        });

        const delNote = await tx.note.create({
            data: {
                entityType: "item",
                entityId: id,
                logId: log_id,
                userId: 1,
                message: `Item ${name} deleted`,
            },
        });
    });
}

const itemQueries = {
    getAllBrands,
    getAllTypes,
    itemQuery,
    itemQueryExactName,
    itemQueryExactNumber,
    itemQueryExactBrand,
    itemQueryExactType,
    itemQueryExactID,
    itemQueryExact,
    addItem,
    editItem,
    deleteItem,
};

export default itemQueries;
