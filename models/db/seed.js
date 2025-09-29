import prisma from "./client.js";
import items from "../items.json" with { type: "json" };
import locations from "../locations.json" with { type: "json" };

// let firstItem = items[0];
// console.log(firstItem.location);

async function main() {
    // locations
    console.log("starting seed process...");
    console.log("seeding locations...");
    for (let i = 0; i < locations.length; i++) {
        let locationResults = await prisma.location.create({
            data: {
                location: locations[i].location,
                zone: locations[i].loc_zone,
                utn: String(locations[i].loc_utn),
            },
        });
    }
    console.log("locations seeding complete.");
    // items
    const joinItems = [];
    console.log("seeding items...");
    for (let j = 0; j < items.length; j++) {
        let itemResults = await prisma.item.create({
            data: {
                item: items[j].item,
                number: String(items[j].item_num),
                type: items[j].item_type,
                brand: items[j].item_brand,
                weight: items[j].weight,
                onHand: items[j].onhand,
                palletQty: items[j].pallet_qty,
            },
        });
        if (items[j].location != "") {
            joinItems.push(items[j]);
        }
    }
    console.log("items seeding complete.");
    console.log("seeding join table...");
    for (let k = 0; k < joinItems.length; k++) {
        let item = joinItems[k];

        let itemId = await prisma.item.findUnique({
            where: {
                item: joinItems[k].item,
            },
            select: {
                id: true,
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
                    location: joinLocations[l],
                },
                select: {
                    id: true,
                },
            });

            let result = await prisma.itemLocation.create({
                data: {
                    itemId: itemId.id,
                    locationId: locId.id,
                },
            });
        }
    }
    console.log("join table seeding complete");
    console.log("database successfully seeded!");
}

// main();

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
