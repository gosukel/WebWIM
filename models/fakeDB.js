import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const results = await prisma.location.findMany({
    include: {
        items: {
            select: {
                item: true,
            },
        },
    },
    take: 3,
});

console.log(JSON.stringify(results, null, 2));

// {
//     "item": "FXE36HP230V1R32AH",
//     "item_num": "719564",
//     "item_type": "INDOOR",
//     "item_brand": "FLEXX",
//     "location": "EQ95",
//     "loc_id": 98,
//     "alt_location_one": "",
//     "alt_location_two": "",
//     "weight": 179,
//     "onhand": 0,
//     "pallet_qty": 2,
//     "item_history": ""
// },
// {
//     "item": "MUL48HP230V1R32AO",
//     "item_num": "721758",
//     "item_type": "OUTDOOR",
//     "item_brand": "MULTI",
//     "location": "EQ59",
//     "loc_id": 62,
//     "alt_location_one": "",
//     "alt_location_two": "",
//     "weight": 190,
//     "onhand": 0,
//     "pallet_qty": 4,
//     "item_history": ""
// }
