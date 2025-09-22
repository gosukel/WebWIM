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

async function getBrands() {
    const brands = await prisma.item.findMany({
        select: {
            brand: true,
        },
        distinct: ["brand"],
    });
    console.log(brands);
}

const processQueries = {
    getItems,
    getBrands,
};

export default processQueries;
