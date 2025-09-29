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

async function itemQueryExactBrand(brand) {
    const result = await prisma.item.findFirst({
        where: {
            brand: brand,
        },
    });
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
    return items;
}

async function itemQueryExactName(item) {
    const existingItem = await prisma.item.findFirst({
        where: {
            item: item,
        },
    });
    return existingItem;
}

async function itemQueryExactNumber(num) {
    const existingItem = await prisma.item.findFirst({
        where: {
            number: num,
        },
    });
    return existingItem;
}
// item = {
//     item: req.body["item-name"],
//     number: req.body["item-number"],
//     brand: req.body["item-brand"],
//     type: req.body["item-type"],
//     weight: req.body["item-weight"],
//     pallet: req.body["item-pallet"],
//     locations: req.body["item-location"],
// };
async function addItem(item) {
    return;
}

async function editItem(item) {
    return;
}

const itemQueries = {
    getAllBrands,
    getAllTypes,
    itemQuery,
    itemQueryExactName,
    itemQueryExactNumber,
    itemQueryExactBrand,
    addItem,
    editItem,
};

export default itemQueries;
