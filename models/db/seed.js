import prisma from "./client.js";
// import items from "../items.json" with { type: "json" };
// import locations from "../locations.json" with { type: "json" };
// import userQueries from "./users.js";
import bcrypt from "bcrypt";
import fs from "fs";
import { resolveTxt } from "dns";

async function seedWarehouse() {
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
                let locJoinNote = await tx.note.create({
                    data: {
                        entityType: "location",
                        entityId: locId.id,
                        logId: log_id,
                        userId: 1,
                        message: `SEED - ITEM added ${itemId.name}`,
                    },
                });
                let itemJoinNote = await tx.note.create({
                    data: {
                        entityType: "item",
                        entityId: itemId.id,
                        logId: log_id,
                        userId: 1,
                        message: `SEED - LOCATION added ${locId.name}`,
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

async function addAdminUser() {
    const plainPassword = "password";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = await prisma.user.create({
        data: {
            username: "admin",
            password: hashedPassword,
            email: "admin@test.com",
            fullName: "Admin",
            nickname: "ADM",
            role: "ADMIN",
        },
    });
}

async function addNonAdminUser() {
    const plainPassword = "password";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = await prisma.user.create({
        data: {
            username: "user",
            password: hashedPassword,
            email: "user@test.com",
            fullName: "User",
            nickname: "USR",
            role: "USER",
        },
    });
}

async function updateAdminPassword() {
    const plainPassword = "password";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const updateUser = await prisma.user.update({
        where: {
            username: "admin",
        },
        data: {
            password: hashedPassword,
        },
    });
}

async function createWarehouseBackup() {
    // log date function
    function getDate() {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");
        const YYYY = now.getFullYear();
        const MM = pad(now.getMonth() + 1);
        const DD = pad(now.getDate());
        const HH = pad(now.getHours());
        const MN = pad(now.getMinutes());
        const SS = pad(now.getSeconds());
        const dateString = `${YYYY}${MM}${DD}${HH}${MN}${SS}`;
        return dateString;
    }
    const logDate = getDate();
    const backupDirectory = `./models/backups/${logDate}`;

    // create directory
    await fs.mkdir(backupDirectory, { recursive: true }, (err) => {
        if (err) {
            console.error("error creating target dir", err);
        } else {
            console.log("successfully created target dir");
        }
    });
    // file writing function
    async function createLog(filePath, fileText, fileType = "utf-8") {
        fs.writeFile(filePath, fileText, fileType, (err) => {
            if (err) {
                console.error(`Error writing to file: ${filePath}`, err);
            } else {
                console.log(`Successfully wrote to ${filePath}`);
            }
        });
    } // get items
    const itemsFilePath = `${backupDirectory}/items.json`;
    const currentItems = await prisma.item.findMany({
        include: {
            locations: {
                select: {
                    location: true,
                    stock: true,
                },
            },
        },
    });
    const currentItemsJSON = await JSON.stringify(currentItems);
    await createLog(itemsFilePath, currentItemsJSON);

    // get locations
    const locationsFilePath = `${backupDirectory}/locations.json`;
    const currentLocations = await prisma.location.findMany();
    const currentLocationsJSON = await JSON.stringify(currentLocations);
    createLog(locationsFilePath, currentLocationsJSON);

    // get orders
    const ordersFilePath = `${backupDirectory}/orders.json`;
    const currentOrders = await prisma.order.findMany({
        include: {
            items: {
                select: {
                    item: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                    quantity: true,
                },
            },
            user: {
                select: {
                    nickname: true,
                    id: true,
                },
            },
        },
    });
    const currentOrdersJSON = await JSON.stringify(currentOrders);
    createLog(ordersFilePath, currentOrdersJSON);

    // get users
    const usersFilePath = `${backupDirectory}/users.json`;
    const currentUsers = await prisma.user.findMany();
    const currentUsersJSON = await JSON.stringify(currentUsers);
    createLog(usersFilePath, currentUsersJSON);
}

// models\backups\20260422200019\users.json
// C:\Program Files\CodingBucket\WebDevPortfolio\WebWIM\models\backups\20260422200019
async function resetWarehouseFromBackup(
    backupDirectory = "./models/backups/20260422200019",
) {
    // GET GENERAL logId FOR RESTORE
    const log_id = crypto.randomUUID();

    // READ FILES
    let usersDataBackup = JSON.parse(
        fs.readFileSync(`${backupDirectory}/users.json`, "utf-8"),
    );
    let locationsDataBackup = JSON.parse(
        fs.readFileSync(`${backupDirectory}/locations.json`, "utf-8"),
    );
    let itemsDataBackup = JSON.parse(
        fs.readFileSync(`${backupDirectory}/items.json`, "utf-8"),
    );

    let ordersDataBackup = JSON.parse(
        fs.readFileSync(`${backupDirectory}/orders.json`, "utf-8"),
    );

    // ADD USERS
    await prisma.$transaction(async (tx) => {
        const newUsers = await tx.user.createManyAndReturn({
            data: usersDataBackup,
            skipDuplicates: true,
        });
        for (let user of newUsers) {
            await tx.note.create({
                data: {
                    message: `USER restored from backup ${user.nickname}`,
                    entityType: "user",
                    entityId: user.id,
                    entityName: user.nickname,
                    logId: log_id,
                    userId: 1,
                },
            });
        }
    });
    // ADD LOCATIONS
    await prisma.$transaction(async (tx) => {
        const newLocations = await tx.location.createManyAndReturn({
            data: locationsDataBackup,
            skipDuplicates: true,
        });
        for (let loc of newLocations) {
            await tx.note.create({
                data: {
                    message: `LOCATION restored from backup ${loc.name}`,
                    entityType: "location",
                    entityId: loc.id,
                    entityName: loc.name,
                    logId: log_id,
                    userId: 1,
                },
            });
        }
    });
    // ADD ITEMS
    let itemLocationJoinList = [];
    for (let item of itemsDataBackup) {
        if (item.locations.length !== 0) {
            itemLocationJoinList.push(item);
        }
        await prisma.$transaction(async (tx) => {
            const newItem = await tx.item.create({
                data: {
                    id: item.id,
                    name: item.name,
                    number: item.number,
                    type: item.type,
                    brand: item.brand,
                    weight: item.weight,
                    palletQty: item.palletQty,
                },
            });
            await tx.note.create({
                data: {
                    message: `ITEM restored from backup ${item.name}`,
                    entityType: "item",
                    entityId: item.id,
                    entityName: item.name,
                    logId: log_id,
                    userId: 1,
                },
            });
        });
    }
    // JOIN ITEMS WITH LOCATIONS
    for (let item of itemLocationJoinList) {
        let itemLocationObj = item.locations[0].location;
        // console.dir(item.locations[0].location);
        let locId = await prisma.location.findUnique({
            where: {
                name: itemLocationObj.name,
            },
            select: {
                id: true,
                name: true,
            },
        });
        await prisma.$transaction(async (tx) => {
            let result = await tx.itemLocation.create({
                data: {
                    itemId: item.id,
                    locationId: locId.id,
                },
            });
            let locJoinNote = await tx.note.create({
                data: {
                    entityType: "location",
                    entityId: locId.id,
                    entityName: locId.name,
                    logId: log_id,
                    userId: 1,
                    message: `ITEM added ${item.name}`,
                },
            });
            let itemJoinNote = await tx.note.create({
                data: {
                    entityType: "item",
                    entityId: item.id,
                    entityName: item.name,
                    logId: log_id,
                    userId: 1,
                    message: `LOCATION added ${locId.name}`,
                },
            });
        });
    }

    // ADD ORDERS
    for (let order of ordersDataBackup) {
        await prisma.$transaction(async (tx) => {
            let newOrder = await tx.order.create({
                data: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    pieces: order.pieces,
                    weight: order.weight,
                    palletCount: order.palletCount,
                    userId: order.userId,
                    createdAt: order.createdAt,
                },
            });
            let orderNote = await tx.note.create({
                data: {
                    entityType: "order",
                    entityId: order.id,
                    entityName: order.orderNumber,
                    logId: log_id,
                    userId: 1,
                    message: `ORDER restored from backup ${order.orderNumber}`,
                },
            });
        });
        // JOIN ITEMS WITH ORDER
        await prisma.$transaction(async (tx) => {
            for (let item of order.items) {
                let joinedOrderItem = await tx.itemOrder.create({
                    data: {
                        itemId: item.item.id,
                        orderId: order.id,
                        quantity: item.quantity,
                    },
                });
                let itemNote = await tx.note.create({
                    data: {
                        entityType: "item",
                        entityId: item.item.id,
                        entityName: item.item.name,
                        userId: 1,
                        logId: log_id,
                        message: `x${item.quantity} added to Order# ${order.orderNumber}`,
                    },
                });
                let orderNote = await tx.note.create({
                    data: {
                        entityType: "order",
                        entityId: order.id,
                        entityName: order.orderNumber,
                        userId: 1,
                        logId: log_id,
                        message: `x${item.quantity} ${item.item.name} added to order`,
                    },
                });
            }
        });
    }

    console.log("success");
}

async function testUserQueries() {
    let testParams = ["username", "fullName", "nickname", "email"];
    let testParam = ["id"];
    let testq1 = "adm";
    let testq2 = "";
    let users = await userQueries.userQuery();
    console.dir(users, { depth: null });
}

// await resetWarehouseFromBackup();

await createWarehouseBackup();

// await addNonAdminUser();

// await addAdminUser();

// await seedWarehouse();

// await updateAdminPassword();

// async function deleteSomething() {
//     await prisma.note.delete({
//         where: {
//             id: 1127,
//         },
//     });
//     await prisma.order.deleteMany({});
// }

// await deleteSomething();
