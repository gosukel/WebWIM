import prisma from "./client.js";

const noteFilters = {
    itemChangeLog: (exact) => ({
        OR: [
            {
                AND: [{ entityType: exact.eType }, { entityId: exact.eId }],
            },
            {
                AND: [{ entityType: exact.eType }, { entityName: exact.eName }],
            },
            {
                AND: [
                    { message: { contains: exact.eName, mode: "insensitive" } },
                    { entityType: exact.eType },
                ],
            },
        ],
    }),
    itemLocations: (exact) => ({
        AND: [
            { entityType: exact.eType },
            { entityId: exact.eId },
            {
                message: {
                    contains: "location",
                    mode: "insensitive",
                },
            },
        ],
    }),
    locChangeLog: (exact) => ({
        AND: [{ entityType: exact.eType }, { entityId: exact.eId }],
    }),
    locationItems: (exact) => ({
        AND: [
            { entityType: exact.eType },
            { entityId: exact.eId },
            {
                message: {
                    contains: "item",
                    mode: "insensitive",
                },
            },
        ],
    }),
    adminLog: (exact) => {
        let where = {};
        if (exact === "all" || exact === "") {
            return where;
        }
        // search for item id
        where = {
            OR: [
                {
                    entityName: { contains: exact, mode: "insensitive" },
                },
                {
                    logId: { contains: exact, mode: "insensitive" },
                },
            ],
        };
        return where;
    },
};

async function noteQuery(exact, noteType = "") {
    let where = noteFilters[noteType]?.(exact) || {};
    let orderBy = { date: "desc" };
    let prismaQuery = {
        where,
        orderBy,
        include: {
            user: true,
        },
    };

    let notes = await prisma.note.findMany(prismaQuery);
    const formattedNotes = notes.map((note) => ({
        ...note,
        date: note.date.toLocaleDateString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
        }),
    }));
    return formattedNotes;
}

const noteQueries = {
    noteQuery,
};

export default noteQueries;
