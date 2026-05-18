import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { formatSlot } from "./adapter";

interface MikhailovskyRawItem {
    id: string;
    date: string;        // "April 01", "February 12"
    time: string;        // "19:00"
    dayOfWeek: string;   // "Wed"
    title: string;       // "Romeo and Juliet"
    type: string | null; // "ballet", "opera", or null
    isPremiere: boolean;
    imageUrl: string | null;
    detailUrl: string | null;
    buyUrl: string | null;
    music: string | null;
    choreography: string | null;
    production: string | null;
    cast: string[];
    conductor: string | null;
}

const MONTH_MAP: Record<string, string> = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
};

/**
 * Parse "April 01" → "2026-04-01"
 * Uses current year, but if month is before current month, assumes next year.
 */
function parseDate(dateStr: string): string {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length !== 2) return "2026-01-01";

    const monthName = parts[0];
    const day = parts[1].padStart(2, "0");
    const monthNum = MONTH_MAP[monthName] || "01";

    const now = new Date();
    let year = now.getFullYear();

    // If month is before current month, it's likely next year
    const monthIdx = parseInt(monthNum);
    const currentMonth = now.getMonth() + 1;
    if (monthIdx < currentMonth) {
        year += 1;
    }

    return `${year}-${monthNum}-${day}`;
}

export async function importMikhailovskyTickets(attractionId?: string) {
    try {
        const filePath = path.join(process.cwd(), "mikhailovsky.json");
        console.log("Reading file from:", filePath);

        try {
            await fs.access(filePath);
        } catch {
            return { success: false, error: "mikhailovsky.json not found" };
        }

        const fileContent = await fs.readFile(filePath, "utf-8");
        const rawJson = JSON.parse(fileContent);

        // The worker returns { performances: [...] }
        const rawData: MikhailovskyRawItem[] = Array.isArray(rawJson)
            ? rawJson
            : (rawJson.performances || []);

        if (rawData.length === 0) {
            return { success: false, error: "No performances found in mikhailovsky.json" };
        }

        // Group performances by title (same show, multiple dates → multiple slots)
        const groups = new Map<string, {
            title: string;
            type: string | null;
            imageUrl: string | null;
            buyUrl: string | null;
            production: string | null;
            slots: Set<string>;
        }>();

        for (const item of rawData) {
            try {
                const isoDate = parseDate(item.date);
                const slotStr = formatSlot(isoDate, item.time);
                const key = item.title;

                if (!groups.has(key)) {
                    groups.set(key, {
                        title: item.title,
                        type: item.type,
                        imageUrl: item.imageUrl,
                        buyUrl: item.buyUrl,
                        production: item.production,
                        slots: new Set()
                    });
                }

                const group = groups.get(key)!;
                group.slots.add(slotStr);
            } catch (e) {
                console.warn("Skipping invalid item:", item.id, e);
            }
        }

        let count = 0;

        for (const group of groups.values()) {
            const sortedSlots = Array.from(group.slots).sort();
            const description = [
                group.type ? group.type.charAt(0).toUpperCase() + group.type.slice(1) : "Performance",
                group.production ? `Production: ${group.production}` : null
            ].filter(Boolean).join(" | ");

            const existing = await prisma.product.findFirst({
                where: {
                    title: group.title,
                    location: "Mikhailovsky Theatre",
                    type: "THEATER"
                }
            });

            if (existing) {
                const existingSlots = (Array.isArray(existing.availableSlots) ? existing.availableSlots : []) as string[];
                const mergedSlots = Array.from(new Set([...existingSlots, ...sortedSlots])).sort();

                let matchedType = ""
                const descLower = String(group.type || "").toLowerCase()
                if (descLower.includes("ballet") || descLower.includes("dance")) matchedType = "Балет"
                else if (descLower.includes("opera") || descLower.includes("cantata")) matchedType = "Опера"
                else if (descLower.includes("concert") || descLower.includes("symphony") || descLower.includes("piano")) matchedType = "Концерт"

                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        availableSlots: mergedSlots,
                        descriptionRu: existing.descriptionRu || (matchedType ? matchedType : null),
                        ...(attractionId && !existing.attractionId ? { attractionId } : {})
                    }
                });
            } else {
                let matchedType = ""
                const descLower = String(group.type || "").toLowerCase()
                if (descLower.includes("ballet") || descLower.includes("dance")) matchedType = "Балет"
                else if (descLower.includes("opera") || descLower.includes("cantata")) matchedType = "Опера"
                else if (descLower.includes("concert") || descLower.includes("symphony") || descLower.includes("piano")) matchedType = "Концерт"

                await prisma.product.create({
                    data: {
                        title: group.title,
                        description,
                        descriptionRu: matchedType ? matchedType : null,
                        price: 2000,
                        stock: 50,
                        type: "THEATER",
                        location: "Mikhailovsky Theatre",
                        venue: "Mikhailovsky Theatre",
                        city: "Saint Petersburg",
                        availableSlots: sortedSlots,
                        content: "E-Ticket for Mikhailovsky Theatre",
                        ...(attractionId ? { attractionId } : {}),
                    }
                });
                count++;
            }
        }

        return { success: true, count };
    } catch (error) {
        console.error("Mikhailovsky import error:", error);
        return { success: false, error: String(error) };
    }
}
