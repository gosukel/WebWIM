import prisma from "./client.js";

async function locationQueryExact(q) {
    const location = await prisma.location.findFirst({
        select: {
            id: true,
            location: true,
        },
        where: {
            OR: [
                {
                    location: q,
                },

                {
                    utn: q,
                },
            ],
        },
    });
    return location;
}

const locationQueries = {
    locationQueryExact,
};

export default locationQueries;
