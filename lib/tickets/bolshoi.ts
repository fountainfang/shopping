import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function importBolshoiTickets(attractionId?: string) {
    try {
        // Use absolute path to ensure reliability in local environment
        const filePath = path.join(process.cwd(), "moscow.json");
        console.log("Reading file from:", filePath);

        // Fallback to checks if needed, but for now strict absolute path
        const fileContent = await fs.readFile(filePath, "utf-8")
        const shows = JSON.parse(fileContent)

        let count = 0

        for (const show of shows) {
            // Map "minPrice" to price. If 0, use fallback.
            const price = show.minPrice || 0

            // Date format in JSON: "fullDate": "2026-01-27T15:00:00.000Z"
            // We want to store this in availableSlots to show the date/time
            const date = new Date(show.fullDate)
            const dateStr = date.toISOString().split('T')[0]
            const timeStr = date.toTimeString().slice(0, 5) // "18:00"
            const slot = `${dateStr} ${timeStr}`

            // Create Product
            // Idempotency check:
            // We treat a unique performance as Title + Venue + Specific Slot
            const existingProduct = await prisma.product.findFirst({
                where: {
                    title: show.showName,
                    venue: show.hallName,
                    // availableSlots is a JSON field. 
                    // Searching completely inside JSON arrays with Prisma can be tricky depending on DB ver.
                    // But since we store it as strictly `[slot]`, we can try to match or just filter.
                    // For safety/simplicity with standard Prisma pattern:
                    // We'll trust Title + Venue + Type is a good starting filter, then check slots in JS if needed
                    // OR specifically for this import where we create 1 product per slot:
                    type: "THEATER"
                }
            })

            // If we find products with the same Title/Venue, we need to check if any of them *is for this specific date*.
            // Since `availableSlots` is just `[slot]`, we can check if we found a match.
            // However, finding *all* matching title/venue might be heavy. 
            // Let's rely on constructing a unique enough query or just accepting that we iterate.

            // Optimization: Let's try to find an EXACT match if possible.
            // Using equals on JSON for a simple array `[slot]` works in Postgres.
            const exactMatch = await prisma.product.findFirst({
                where: {
                    title: show.showName,
                    venue: show.hallName,
                    type: "THEATER",
                    availableSlots: {
                        equals: [slot]
                    }
                }
            })

            if (exactMatch) {
                console.log(`Skipping duplicate: ${show.showName} at ${slot}`)
                // Optional: Update price/stock if changed?
                await prisma.product.update({
                    where: { id: exactMatch.id },
                    data: {
                        stock: show.freeSeats || 100,
                        price: parseFloat(price),
                        ...(attractionId && !exactMatch.attractionId ? { attractionId } : {})
                    }
                })
            } else {
                await prisma.product.create({
                    data: {
                        title: show.showName,
                        description: show.description || show.showForeignName || "No description",
                        price: parseFloat(price),
                        stock: show.freeSeats || 100,
                        type: "THEATER",
                        location: "Bolshoi Theatre",
                        venue: show.hallName,
                        city: "Moscow",
                        availableSlots: [slot],
                        content: "E-Ticket for Bolshoi Theatre",
                        ...(attractionId ? { attractionId } : {}),
                    }
                })
                count++
            }
        }

        return { success: true, count }
    } catch (error) {
        console.error("Bolshoi import error:", error)
        return { success: false, error: String(error) }
    }
}
