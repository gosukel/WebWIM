import prisma from "./client.js";
// location - zone - utn - items
async function locationQuery(filters = [], sort = "", direction = "") {
    const where =
        filters.length > 0
            ? {
                  AND: filters.map((term) => ({
                      OR: [
                          {
                              location: {
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
                                          item: {
                                              contains: term,
                                              mode: "insensitive",
                                          },
                                          type: {
                                              contains: term,
                                              mode: "insensitive",
                                          },
                                          brand: {
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
    const orderBy =
        sort != "" && sort != "items" && direction != ""
            ? { [sort]: direction }
            : { id: "asc" };

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

async function locationQueryExact(q) {
    const location = await prisma.location.findFirst({
        select: {
            id: true,
            location: true,
        },
        where: {
            OR: [
                {
                    location: q,
                },

                {
                    utn: q,
                },
            ],
        },
    });
    return location;
}

const locationQueries = {
    locationQuery,
    getAllZones,
};

export default locationQueries;
