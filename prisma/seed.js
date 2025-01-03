const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.lLM.createMany({
        data: [
            { name: 'mixtral-8x7b-32768' },
            { name: 'llama-3.1-8b-instant' },
            { name: 'whisper-large-v3-turbo' },
            { name: 'gemma2-9b-it' },
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
