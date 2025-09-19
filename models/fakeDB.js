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
