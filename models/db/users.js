import prisma from "./client.js";
import bcrypt from "bcrypt";

// model User {
//   id       Int     @id @default(autoincrement())
//   username String  @unique
//   password String
//   email    String  @unique
//   fullName String  @unique @map("full_name")
//   nickname String  @unique
//   branch   String  @default("024")
//   role     Role    @default(USER)
//   orders   Order[]
//   notes    Note[]  @relation("UserNotes")

//   @@map("users")
// }

function generateQuerySelector(q, params, mode) {
    let whereObj;

    // searching by single parameter
    if (params.length === 1) {
        whereObj = {
            [params[0]]: q,
            mode,
        };
    } else if (params.length > 1) {
        whereObj = {
            OR: params.map((param) => {
                let orItem = {
                    [param]: q,
                    mode,
                };
                return orItem;
            }),
        };
    }
    return whereObj;
}

async function userQueryExact(where) {
    // console.log("db func");
    // console.dir(where, { depth: null });
    const userExact = await prisma.user.findFirst({
        where,
    });
    // console.dir(userExact, { depth: null });
    return userExact;
}

async function userQueryAll(q = "") {
    let where = {};
    if (q !== "") {
        where = {
            OR: [
                {
                    username: { contains: q, mode: "insensitive" },
                },
                {
                    fullName: { contains: q, mode: "insensitive" },
                },
                {
                    nickname: { contains: q, mode: "insensitive" },
                },
                {
                    email: { contains: q, mode: "insensitive" },
                },
                {
                    branch: q,
                },
            ],
        };
    }
    const users = await prisma.user.findMany({
        where,
        orderBy: {
            id: "asc",
        },
    });
    return users;
}

async function userQuery(
    q = "",
    param = "",
    password = false,
    includeInactive = false,
) {
    let where;
    if (q !== "" && param === "") {
        where = {
            status: "ACTIVE",
            OR: [
                {
                    username: { contains: q, mode: "insensitive" },
                },
                {
                    fullName: { contains: q, mode: "insensitive" },
                },
                {
                    nickname: { contains: q, mode: "insensitive" },
                },
                {
                    email: { contains: q, mode: "insensitive" },
                },
                {
                    branch: q,
                },
            ],
        };
    } else if (param === "id") {
        where = {
            [param]: q,
            status: "ACTIVE",
        };
    } else if (param !== "") {
        where = {
            [param]: {
                equals: q,
                mode: "insensitive",
            },
            status: "ACTIVE",
        };
    } else {
        where = {
            status: "ACTIVE",
        };
    }
    let select;
    if (!password) {
        select = {
            id: true,
            username: true,
            email: true,
            fullName: true,
            nickname: true,
            branch: true,
            role: true,
            status: true,
        };
    } else {
        select = {
            id: true,
            username: true,
            email: true,
            fullName: true,
            nickname: true,
            branch: true,
            role: true,
            password: true,
            status: true,
        };
    }
    const users = await prisma.user.findMany({
        where,
        select,
    });
    return users;
}

async function addUser(newUser, curUser) {
    const log_id = crypto.randomUUID();
    // let passwordHash = await bcrypt.hash(newUser.password, 10);
    await prisma.$transaction(async (tx) => {
        const newUserCreate = await tx.user.create({
            data: {
                username: newUser.username,
                password: newUser.passwordHash,
                email: newUser.email,
                fullName: newUser.fullName,
                nickname: newUser.nickname,
                branch: newUser.branch,
                role: newUser.role,
            },
        });
        await tx.note.create({
            data: {
                message: `USER created ${newUser.nickname}`,
                entityType: "user",
                entityId: newUserCreate.id,
                entityName: newUserCreate.nickname,
                logId: log_id,
                userId: curUser.id,
            },
        });
    });
    return true;
}

async function deleteUser(delUser, curUser) {
    const log_id = crypto.randomUUID();
    await prisma.$transaction(async (tx) => {
        let delUserUpdate = await tx.user.update({
            where: {
                id: delUser.id,
            },
            data: {
                status: "INACTIVE",
            },
        });
        await tx.note.create({
            data: {
                message: `USER deactivated ${delUserUpdate.nickname}`,
                entityType: "user",
                entityId: delUserUpdate.id,
                entityName: delUserUpdate.nickname,
                logId: log_id,
                userId: curUser.id,
            },
        });
    });
}

async function updateUserDetails(editUser, update) {
    return await prisma.$transaction(async (tx) => {
        // update user
        await tx.user.update({
            where: { id: editUser.id },
            data: update.data,
        });

        // update notes that user old nickname
        if (update.oldNickname) {
            await tx.note.updateMany({
                where: {
                    entityName: update.oldNickname,
                },
                data: {
                    entityName: update.data.nickname,
                },
            });
        }

        // create change notes
        if (update.changeList.length > 0) {
            await tx.note.createMany({
                data: update.changeList,
            });
        }
    });
}

async function editUser(editUser, author) {
    // get current user details
    const curUser = await prisma.user.findFirst({
        where: {
            id: editUser.id,
        },
    });

    // prop obj variables
    let update = {
        status: false,
        data: {},
        changeList: [],
    };

    const log_id = crypto.randomUUID();

    for (const prop in editUser) {
        // ignore id
        if (prop === "id") {
            continue;
        }

        // check password
        if (prop === "password") {
            // check for no password input
            if (!editUser[prop]) {
                continue;
            }

            const match = await bcrypt.compareSync(
                editUser.password,
                curUser.password,
            );
            if (!match) {
                if (!update.status) {
                    update.status = true;
                }
                let newPasswordHash = await bcrypt.hash(editUser.password, 10);
                update.data[prop] = newPasswordHash;
                update.changeList.push({
                    entityType: "user",
                    entityId: editUser.id,
                    entityName: editUser.nickname,
                    logId: log_id,
                    userId: author.id,
                    message: `PASSWORD change`,
                });
            }
            continue;
        }

        // check nickname
        if (prop === "nickname") {
            if (editUser[prop] === curUser[prop]) {
                continue;
            }
            if (!update.status) {
                update.status = true;
            }
            update.data[prop] = editUser[prop];
            update.oldNickname = curUser.nickname;
            update.changeList.push({
                entityType: "user",
                entityId: editUser.id,
                entityName: editUser.nickname,
                logId: log_id,
                userId: author.id,
                message: `${prop.toUpperCase()} from ${curUser[prop]} to ${editUser[prop]}`,
            });
            continue;
        }

        // all other props
        if (editUser[prop] !== curUser[prop]) {
            if (!update.status) {
                update.status = true;
            }
            update.data[prop] = editUser[prop];
            update.changeList.push({
                entityType: "user",
                entityId: editUser.id,
                entityName: editUser.nickname,
                logId: log_id,
                userId: author.id,
                message: `${prop.toUpperCase()} from ${curUser[prop]} to ${editUser[prop]}`,
            });
        }
    }
    if (update.status) {
        await updateUserDetails(editUser, update);
    }
    return;
}

const userQueries = {
    userQuery,
    addUser,
    editUser,
    deleteUser,
    userQueryAll,
    userQueryExact,
};

export default userQueries;
