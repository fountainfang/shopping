import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { normalizeMoscowEvent } from "../lib/tickets/moscow";
import { NormalizedEvent, formatSlot } from "../lib/tickets/adapter";

const prisma = new PrismaClient();

async function main() {
    const filePath = path.join(process.cwd(), "moscow.json");
    if (!fs.existsSync(filePath)) {
        console.error("moscow.json not found!");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log(`Loaded ${rawData.length} items from moscow.json`);

    // Grouping Map: Key = "Title|Hall" -> Value = { ProductData, Slots[] }
    const groups = new Map<string, {
        base: NormalizedEvent,
        slots: Set<string>, // Use Set to avoid duplicates
        minPrice: number
    }>();

    // 1. Normalize and Group
    for (const item of rawData) {
        try {
            const event = normalizeMoscowEvent(item);
            const key = `${event.title}|${event.hall}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    base: event,
                    slots: new Set(),
                    minPrice: event.minPrice
                });
            }

            const group = groups.get(key)!;
            // Merge slots
            const slotStr = formatSlot(event.date, event.time); // YYYY-MM-DD HH:mm
            group.slots.add(slotStr);

            // Keep lowest price
            if (event.minPrice < group.minPrice) {
                group.minPrice = event.minPrice;
                group.base.minPrice = event.minPrice;
            }

        } catch (e) {
            console.warn("Skipping invalid item", item, e);
        }
    }

    console.log(`Grouped into ${groups.size} unique Products.`);

    // 2. Upsert to DB
    for (const group of groups.values()) {
        const { base, slots, minPrice } = group;
        const sortedSlots = Array.from(slots).sort();

        // Check if exists by Title + Hall (Venue)
        // Since we don't have a unique constraint on (title, venue), we search first.
        // Ideally we'd use title in English.

        const existing = await prisma.product.findFirst({
            where: {
                title: base.title,
                venue: base.hall,
                type: "THEATER"
            }
        });

        if (existing) {
            // Update
            console.log(`Updating ${base.title} (${base.hall})...`);

            // Merge slots with existing
            const existingSlots = (Array.isArray(existing.availableSlots) ? existing.availableSlots : []) as string[];
            const mergedSlots = Array.from(new Set([...existingSlots, ...sortedSlots])).sort();

            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    price: Math.min(existing.price, minPrice), // Keep lowest known price
                    availableSlots: mergedSlots,
                    // Update descriptions if missing?
                    description: existing.description || base.description || "",
                    titleRu: existing.titleRu || base.titleRu,
                    descriptionRu: existing.descriptionRu || base.performanceType || null,
                }
            });
        } else {
            // Create
            console.log(`Creating ${base.title} (${base.hall})...`);
            await prisma.product.create({
                data: {
                    title: base.title,
                    description: base.description || `Tickets for ${base.title} at ${base.theater}`,
                    titleRu: base.titleRu,
                    descriptionRu: base.performanceType || null,
                    price: minPrice,
                    stock: 100, // Placeholder
                    type: "THEATER",
                    location: base.theater,
                    venue: base.hall,
                    city: "Moscow",
                    cityZh: "莫斯科",
                    cityRu: "Москва",
                    availableSlots: sortedSlots
                }
            });
        }
    }

    console.log("Import complete.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
