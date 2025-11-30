import prisma from "./client.js";

async function getItems(query = "", brand = "") {
    if (query === "" && brand === "") {
        const items = await prisma.item.findMany({
            select: {
                name: true,
                weight: true,
                palletQty: true,
                brand: true,
            },
        });
        return items;
    }
}

async function orderQuery(filters = []) {
    // build filter obj
    const where =
        filters.length > 0
            ? {
                  AND: filters.map((term) => ({
                      OR: [
                          {
                              orderNumber: {
                                  contains: term,
                                  mode: "insensitive",
                              },
                          },
                          {
                              items: {
                                  some: {
                                      item: {
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
    const orders = await prisma.order.findMany({
        where,
        orderBy: {
            createdAt: "asc",
        },
        include: {
            items: {
                select: {
                    item: true,
                    quantity: true,
                },
            },
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
    return orders;
}

async function orderQueryExact(order) {
    const orderMatch = await prisma.order.findFirst({
        where: {
            orderNumber: order,
        },
        include: {
            items: {
                select: {
                    item: true,
                    quantity: true,
                },
            },
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
    let formattedOrder;
    if (orderMatch) {
        formattedOrder = {
            ...orderMatch,
            createdAt: orderMatch.createdAt.toLocaleDateString("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
            }),
        };
    } else {
        formattedOrder = orderMatch;
    }
    return formattedOrder;
}

async function addOrder(order) {
    let newOrder = await prisma.$transaction(async (tx) => {
        let plt = Number(order.orderDetails.totalPalletsDec);
        // add new order to generate order id
        const txNewOrder = await tx.order.create({
            data: {
                orderNumber: order.orderNumber,
                pieces: order.orderDetails.totalPieces,
                weight: order.orderDetails.totalWeight,
                palletCount: plt,
                userId: 1,
                items: {
                    create: order.orderItems.map((item) => ({
                        item: { connect: { id: item.id } },
                        quantity: item.qty,
                    })),
                },
            },
        });
        // create note records
        const log_id = crypto.randomUUID();
        let notes = [
            {
                entityType: "order",
                entityId: txNewOrder.id,
                userId: 1,
                logId: log_id,
                message: `Order Created - ${txNewOrder.orderNumber}`,
            },
        ];
        for (let item of order.orderItems) {
            notes.push({
                entityType: "item",
                entityId: item.id,
                userId: 1,
                logId: log_id,
                message: `x${item.qty} added to Order# ${order.orderNumber}`,
            });
        }
        const newNotes = await tx.note.createMany({
            data: notes,
        });
        return txNewOrder;
    });
    return newOrder;
}

const processQueries = {
    getItems,
    orderQuery,
    orderQueryExact,
    addOrder,
};

export default processQueries;
