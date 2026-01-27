import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { normalizeMariinskyEvent } from "../lib/tickets/mariinsky";
import { NormalizedEvent, formatSlot } from "../lib/tickets/adapter";

const prisma = new PrismaClient();

async function main() {
    // Use the downloaded raw file
    const filePath = path.join(process.cwd(), "mariinsky_raw.json");
    if (!fs.existsSync(filePath)) {
        console.error("mariinsky_raw.json not found!");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`Loaded ${rawData.length} items from mariinsky_raw.json`);

    const groups = new Map<string, {
        base: NormalizedEvent,
        slots: Set<string>
    }>();

    // 1. Normalize and Group
    for (const item of rawData) {
        try {
            const event = normalizeMariinskyEvent(item);
            // Key: Title + Hall
            const key = `${event.title}|${event.hall}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    base: event,
                    slots: new Set()
                });
            }

            const group = groups.get(key)!;
            const slotStr = formatSlot(event.date, event.time);
            group.slots.add(slotStr);

        } catch (e) {
            console.warn("Skipping invalid item", e);
        }
    }

    console.log(`Grouped into ${groups.size} unique Mariinsky Productions.`);

    // 2. Upsert to DB
    for (const group of groups.values()) {
        const { base, slots } = group;
        const sortedSlots = Array.from(slots).sort();

        // Check exists
        const existing = await prisma.product.findFirst({
            where: {
                title: base.title,
                venue: base.hall,
                type: "THEATER"
            }
        });

        if (existing) {
            console.log(`Updating ${base.title}...`);
            const existingSlots = (Array.isArray(existing.availableSlots) ? existing.availableSlots : []) as string[];
            const mergedSlots = Array.from(new Set([...existingSlots, ...sortedSlots])).sort();

            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    availableSlots: mergedSlots,
                    // Don't overwrite description if existing has one, unless empty
                    description: existing.description || base.description
                }
            });
        } else {
            console.log(`Creating ${base.title}...`);
            await prisma.product.create({
                data: {
                    title: base.title,
                    description: base.description || `Tickets for ${base.title}`,
                    titleRu: base.titleRu, // might be same as EN for now
                    price: 2000, // Hardcoded placeholder since source has none
                    stock: 50,
                    type: "THEATER",
                    location: base.theater,
                    venue: base.hall,
                    city: "Saint Petersburg",
                    cityZh: "圣彼得堡",
                    cityRu: "Санкт-Петербург",
                    availableSlots: sortedSlots
                }
            });
        }
    }

    console.log("Mariinsky Import complete.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
