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

async function orderQuery(q = "") {
    const where =
        q != ""
            ? {
                  orderNumber: q,
              }
            : {};
    const orders = await prisma.order.findMany({
        where,
        orderBy: {
            createdAt: "asc",
        },
    });
    return orders;
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
    addOrder,
};

export default processQueries;
