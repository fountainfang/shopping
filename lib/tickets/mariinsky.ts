import { prisma } from "@/lib/prisma"

export async function importMariinskyTickets() {
    try {
        const res = await fetch("https://mariinsky.fountain-fang.workers.dev/")
        if (!res.ok) throw new Error("Failed to fetch Mariinsky data")

        const shows = await res.json()
        let count = 0
        const currentYear = new Date().getFullYear()

        for (const show of shows) {
            // Date parsing: "26" "January" "19:00"
            // Need to construct a real date.
            // Simple heuristic: if month is earlier than current month, assume next year? 
            // Or just assume current year + check provided data context.
            // The API seems to just give day/month. Let's assume upcoming.

            const monthMap: Record<string, number> = {
                "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
                "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
            }

            const monthIndex = monthMap[show.month]
            if (monthIndex === undefined) continue // skip invalid

            let year = currentYear
            const now = new Date()
            // If the parsed date is in the past, maybe add 1 year? 
            // Actually, let's just use current year for simplicity unless logic implies otherwise.

            const date = new Date(year, monthIndex, parseInt(show.date))
            if (date < now) {
                date.setFullYear(year + 1)
            }

            const dateStr = date.toISOString().split('T')[0]
            const slot = `${dateStr} ${show.time}`

            // Idempotency check for Mariinsky
            const exactMatch = await prisma.product.findFirst({
                where: {
                    title: show.summary,
                    venue: show.location,
                    type: "THEATER",
                    availableSlots: {
                        equals: [slot]
                    }
                }
            })

            if (exactMatch) {
                // Update stock if different? Mariinsky API doesn't give price always, so maybe just skip or update stock.
                // We'll update just to be safe.
                await prisma.product.update({
                    where: { id: exactMatch.id },
                    data: {
                        stock: 100 // Dummy stock reset? Or keep existing? Let's just keep existing logic of setting 100 if we want to "refresh" availability or just skip.
                        // Actually, if we re-import, we might want to ensure it's "live".
                        // But since we don't have real stock from API here, let's leave it alone or set to 100.
                    }
                })
            } else {
                await prisma.product.create({
                    data: {
                        title: show.summary, // "Die Entführung aus dem Serail"
                        description: show.description,
                        price: 0, // Unknown price
                        stock: 100, // Dummy stock
                        type: "THEATER",
                        location: "Mariinsky Theatre",
                        venue: show.location, // e.g. "Mariinsky II"
                        city: "Saint Petersburg",
                        availableSlots: [slot],
                        content: "E-Ticket for Mariinsky Theatre",
                    }
                })
                count++
            }
        }

        return { success: true, count }
    } catch (error) {
        console.error("Mariinsky import error:", error)
        return { success: false, error: String(error) }
    }
}
