import prisma from "./client.js";

async function itemNoteQuery(eId, eName, eType, noteType = "") {
    let where = {};
    let select = {
        date: true,
        message: true,
        user: {
            select: {
                nickname: true,
            },
        },
    };
    let orderBy = { date: "desc" };
    if (noteType === "changeLog") {
        where = {
            OR: [
                {
                    AND: [{ entityType: eType }, { entityId: eId }],
                },
                {
                    AND: [
                        { message: { contains: eName, mode: "insensitive" } },
                        { entityType: eType },
                    ],
                },
            ],
        };
    }
    if (noteType === "itemLocations") {
        where = {
            OR: [
                {
                    AND: [
                        { entityType: eType },
                        { entityId: eId },
                        {
                            message: {
                                contains: "location",
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            ],
        };
    }
    let notes = await prisma.note.findMany({
        where,
        select,
        orderBy,
    });
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
    itemNoteQuery,
};

export default noteQueries;
