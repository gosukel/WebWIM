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

const itemQueries = {
    getAllItems,
};

export default itemQueries;
