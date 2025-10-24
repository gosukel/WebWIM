import prisma from "./client.js";
import items from "../items.json" with { type: "json" };
import locations from "../locations.json" with { type: "json" };

async function main() {
    // locations
    console.log("starting seed process...");
    console.log("seeding locations...");
    const log_id = crypto.randomUUID();
    for (let i = 0; i < locations.length; i++) {
        await prisma.$transaction(async (tx) => {
            let locationResult = await tx.location.create({
                data: {
                    name: locations[i].location,
                    utn: String(locations[i].loc_utn),
                    zone: locations[i].loc_zone,
                    warehouseIndex: i,
                },
            });
            let locNote = await tx.note.create({
                data: {
                    entityType: "location",
                    entityId: locationResult.id,
                    logId: log_id,
                    userId: 1,
                    message: `SEED - Location Created - ${locationResult.name}`,
                },
            });
        });
    }
    console.log("locations seeding complete.");

    // items
    const joinItems = [];
    console.log("seeding items...");
    for (let j = 0; j < items.length; j++) {
        await prisma.$transaction(async (tx) => {
            let itemResult = await tx.item.create({
                data: {
                    name: items[j].item,
                    number: String(items[j].item_num),
                    type: items[j].item_type,
                    brand: items[j].item_brand,
                    weight: items[j].weight,
                    stock: items[j].onhand,
                    palletQty: items[j].pallet_qty,
                },
            });
            let itemNote = await tx.note.create({
                data: {
                    entityType: "item",
                    entityId: itemResult.id,
                    logId: log_id,
                    userId: 1,
                    message: `SEED - Item Created - ${itemResult.name}`,
                },
            });
        });
        if (items[j].location != "") {
            joinItems.push(items[j]);
        }
    }

    // item-location-joining
    console.log("items seeding complete.");
    console.log("seeding join table...");
    for (let k = 0; k < joinItems.length; k++) {
        let item = joinItems[k];

        let itemId = await prisma.item.findUnique({
            where: {
                name: joinItems[k].item,
            },
            select: {
                id: true,
                name: true,
            },
        });

        let joinLocations = [item.location];
        if (item.alt_location_one != "") {
            joinLocations.push(item.alt_location_one);
        }
        if (item.alt_location_two != "") {
            joinLocations.push(item.alt_location_two);
        }
        for (let l = 0; l < joinLocations.length; l++) {
            let locId = await prisma.location.findUnique({
                where: {
                    name: joinLocations[l],
                },
                select: {
                    id: true,
                    name: true,
                },
            });
            await prisma.$transaction(async (tx) => {
                let result = await tx.itemLocation.create({
                    data: {
                        itemId: itemId.id,
                        locationId: locId.id,
                    },
                });
                let joinNote = await tx.note.create({
                    data: {
                        entityType: "location",
                        entityId: locId.id,
                        logId: log_id,
                        userId: 1,
                        message: `SEED - Item ${itemId.name} added to ${locId.name}`,
                    },
                });
            });
        }
    }
    console.log("join table seeding complete");
    console.log("database successfully seeded!");
}

async function convertBrands() {
    // convert 3VIR to VIR
    const updateItems = await prisma.item.updateManyAndReturn({
        where: {
            brand: "VIRU",
        },
        data: {
            brand: "VIR",
        },
    });
    console.log(updateItems);
}
// convertBrands();

async function addAdminUser() {
    const newUser = await prisma.user.create({
        data: {
            username: "admin",
            password: "password",
            email: "admin@test.com",
            fullName: "Admin",
            nickname: "ADM",
            role: "ADMIN",
        },
    });
}
await addAdminUser();

await main();
