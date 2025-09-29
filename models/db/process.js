import prisma from "./client.js";

async function getItems(query = "", brand = "") {
    if (query === "" && brand === "") {
        const items = await prisma.item.findMany({
            select: {
                item: true,
                weight: true,
                palletQty: true,
                brand: true,
            },
        });
        return items;
    }
}

const processQueries = {
    getItems,
};

export default processQueries;
