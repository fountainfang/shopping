import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Kremlin products...");

    // Generate slots for next 30 days
    const slots: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // 4 slots per day
        slots.push(`${dateStr} 10:00`);
        slots.push(`${dateStr} 12:00`);
        slots.push(`${dateStr} 14:00`);
        slots.push(`${dateStr} 16:00`);
    }

    // 1. Kremlin Armoury Tour
    await prisma.product.upsert({
        where: {
            // We use findFirst usually but upsert requires unique. 
            // Logic: we assume we can match by ID, but since we don't know ID, we might just create if not exists using logic similar to import script.
            // But to keep it simple for this script, I'll delete existing with same title first or just create if empty.
            // Actually, let's just use create or ignore.
            id: 'seed-kremlin-armoury'
        },
        update: {
            availableSlots: slots,
            type: "ATTRACTION"
        },
        create: {
            id: 'seed-kremlin-armoury',
            title: "Remlkin & Armoury Guided Tour",
            titleZh: "克里姆林宫及武器库导览",
            titleRu: "Экскурсия по Кремлю и Оружейной палате",
            description: "Skip the line access to the Kremlin Armoury Chamber and Diamond Fund.",
            descriptionZh: "免排队进入克里姆林宫武器库和钻石馆。",
            descriptionRu: "Проход без очереди в Оружейную палату и Алмазный фонд.",
            price: 50.0,
            stock: 100,
            type: "ATTRACTION",
            location: "Kremlin complex", // Needs to match query "Kremlin complex"
            venue: "Armoury Chamber",
            city: "Moscow",
            cityZh: "莫斯科",
            cityRu: "Москва",
            availableSlots: slots
        }
    });

    // 2. Kremlin General Admission
    await prisma.product.upsert({
        where: { id: 'seed-kremlin-general' },
        update: {
            availableSlots: slots,
            type: "ATTRACTION"
        },
        create: {
            id: 'seed-kremlin-general',
            title: "Kremlin Cathedral Square Ticket",
            titleZh: "克里姆林宫教堂广场门票",
            titleRu: "Билет на Соборную площадь Кремля",
            description: "Access to all open cathedrals within the Kremlin walls.",
            descriptionZh: "进入克里姆林宫墙内所有开放的教堂。",
            descriptionRu: "Доступ во все открытые соборы на территории Кремля.",
            price: 25.0,
            stock: 200,
            type: "ATTRACTION",
            location: "Kremlin complex",
            venue: "Cathedral Square",
            city: "Moscow",
            cityZh: "莫斯科",
            cityRu: "Москва",
            availableSlots: slots
        }
    });

    console.log("Seeding complete.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
