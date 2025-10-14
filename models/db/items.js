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
                              item: {
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
                                          location: {
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
                  item: "asc",
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
        if (direction === "asc") {
            sortedItems = items.sort((a, b) => {
                const locA = a.locations[0]?.location?.id || 10000;
                const locB = b.locations[0]?.location?.id || 10000;
                return locA - locB;
            });
        } else {
            sortedItems = items.sort((a, b) => {
                const locA = a.locations[0]?.location?.id || 10000;
                const locB = b.locations[0]?.location?.id || 10000;
                return locB - locA;
            });
        }

        return sortedItems;
    }
    return items;
}

async function itemQueryExactName(item, id = null) {
    let where;
    if (id) {
        where = {
            item: item,
            id: { not: id },
        };
    } else {
        where = {
            item: item,
        };
    }
    const existingItem = await prisma.item.findFirst({
        where,
    });

    // console.log(`existingItem - ${existingItem}`);
    return existingItem;
}

async function testItemQueryExactName(item, id = null) {
    try {
        let where;
        if (id) {
            where = {
                item: item,
                id: { not: Number(id) },
            };
        } else {
            where = {
                item: item,
            };
        }
        const existingItem = await prisma.item.findFirst({
            where,
        });

        // console.log(existingItem);
        return existingItem;
    } catch (err) {
        console.log(`error: ${err}`);
    }
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

async function addItem(item) {
    const newItem = await prisma.item.create({
        data: {
            item: item.name,
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
    return newItem;
}

async function updateItemWithLocations(itemId, update, connect, disconnect) {
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
                    location: true,
                },
            },
        },
    });

    // prep obj variables
    let update = {
        status: false,
        data: {},
    };
    let disconnect = {
        status: false,
        ids: [],
    };
    let connect = {
        status: false,
        ids: [],
    };

    // check for values that changed, assign to data obj
    for (const prop in curItem) {
        // ignored values
        if (prop === "onHand" || prop === "itemHistory") {
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
                connect.ids = item[prop].map((loc) => loc.id);
                connect.status = true;
                continue;
            }
            // no new location, remove old locations - DISCONNECT ALL
            if (item[prop].length === 0 && curItem[prop].length > 0) {
                disconnect.status = true;
                disconnect.ids = curItem[prop].map((loc) => loc.location.id);
                continue;
            }
            // check new ids vs old ids
            let curLocIds = curItem[prop].map((loc) => loc.location.id);
            let newLocIds = item[prop].map((loc) => loc.id);
            for (let curId of curLocIds) {
                if (!newLocIds.includes(curId)) {
                    disconnect.status = true;
                    disconnect.ids.push(curId);
                }
            }
            for (let newId of newLocIds) {
                if (!curLocIds.includes(newId)) {
                    connect.status = true;
                    connect.ids.push(newId);
                }
            }
            continue;
        }
        if (curItem[prop] != item[prop]) {
            if (!update.status) {
                update.status = true;
            }
            update.data[prop] = item[prop];
        }
    }

    // run edit query
    await updateItemWithLocations(item.id, update, connect, disconnect);
    return;
}

const itemQueries = {
    getAllBrands,
    getAllTypes,
    itemQuery,
    itemQueryExactName,
    testItemQueryExactName,
    itemQueryExactNumber,
    itemQueryExactBrand,
    itemQueryExactType,
    addItem,
    editItem,
};

export default itemQueries;
