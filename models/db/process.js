import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getItems(query = "", brand = "") {
    if (query === "" && brand === "") {
        const items = await prisma.item.findMany({
            select: {
                item: true,
                weight: true,
                palletQty: true,
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
// GMV - LS - PART
// HVAC - OTHER
// CAS - CONS - DUCT - FLEXX - FLR
// LIVV - MULTI - SAP - UMAT - VIR
// GMV - LS - HVAC - PART - OTHER
const processQueries = {
    getItems,
    getBrands,
};

export default processQueries;
