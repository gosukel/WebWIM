import prisma from "./client.js";

async function getAllItems() {
    const items = await prisma.item.findMany({
        include: {
            locations: {
                select: {
                    location: true,
                    stock: true,
                },
            },
        },
    });
    return items;
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
        sort != "" && direction != ""
            ? {
                  [sort]: direction,
              }
            : {};

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
    return items;
}

async function sortItems(sortParam, sortDirection, q = "") {
    const items = await prisma.item.findMany({
        include: {
            locations: {
                select: {
                    location: true,
                    stock: true,
                },
            },
        },
        orderBy: {
            [sortParam]: sortDirection,
        },
    });
    // console.log("finishing");
    return items;
}

const itemQueries = {
    getAllItems,
    itemQuery,
};

export default itemQueries;

// where: {
//     AND: filters.map((term) => ({
//         OR: [
//             { item: { contains: term, mode: "insensitive" } },
//             { number: { contains: term, mode: "insensitive" } },
//             { type: { contains: term, mode: "insensitive" } },
//             { brand: { contains: term, mode: "insensitive" } },
//             {
//                 locations: {
//                     some: {
//                         location: {
//                             location: {
//                                 contains: term,
//                                 mode: "insensitive",
//                             },
//                         },
//                     },
//                 },
//             },
//         ],
//     })),
// },
