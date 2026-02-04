import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { formatSlot, NormalizedEvent } from "./adapter";

interface MariinskyRawItem {
    date: string;       // "26"
    month: string;      // "January"
    location: string;   // "Mariinsky Theatre"
    time: string;       // "19:00"
    summary: string;    // Title "Die Entführung aus dem Serail"
    description: string;
}

const MONTH_MAP: Record<string, string> = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
};

export function normalizeMariinskyEvent(item: MariinskyRawItem): NormalizedEvent {
    // Assume 2026 for now as per context of moscow.json
    const year = "2026";
    const monthNum = MONTH_MAP[item.month] || "01";
    console.log(`Normalizing: ${item.month} -> ${monthNum}`); // Debug log

    const dayNum = item.date.padStart(2, '0');

    // Construct ISO Date: YYYY-MM-DD
    const isoDate = `${year}-${monthNum}-${dayNum}`;

    // Unique ID generation (since source lacks ID)
    // simplistic hash or just combine fields
    const importId = `mar-${isoDate}-${item.time}-${item.location}-${item.summary}`.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    return {
        importId,
        title: item.summary,
        titleRu: item.summary, // Mariinsky JSON seems to give English/Latin titles in summary. We might not have Ru title here easily.
        description: item.description,
        theater: "Mariinsky Theater",
        hall: item.location,    // "Mariinsky II", "Concert Hall", etc.
        minPrice: 0,            // Price not available in this feed

        date: isoDate,
        time: item.time,
        fullIsoDate: new Date(`${isoDate}T${item.time}:00`).toISOString()
    };
}

export async function importMariinskyTickets() {
    try {
        const filePath = path.join(process.cwd(), "mariinsky_raw.json");
        console.log("Reading file from:", filePath);

        // Check if file exists to avoid crash
        try {
            await fs.access(filePath);
        } catch {
            return { success: false, error: "mariinsky_raw.json not found" };
        }

        const fileContent = await fs.readFile(filePath, "utf-8");
        const rawData: MariinskyRawItem[] = JSON.parse(fileContent);

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

        let count = 0;

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
                        availableSlots: sortedSlots,
                        content: `E-Ticket for ${base.theater}`
                    }
                });
                count++;
            }
        }

        return { success: true, count };
    } catch (error) {
        console.error("Mariinsky import error:", error);
        return { success: false, error: String(error) };
    }
}
