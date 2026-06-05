import { prisma } from "./prisma"

/**
 * Ensures that the booking slots for all attraction products of a given attraction
 * are generated and kept up-to-date according to the attraction's booking window,
 * closed days, start/end time, and slot intervals.
 * 
 * This function uses a sliding window: it automatically removes past slots and 
 * generates new ones up to today + bookingWindow - 1.
 */
export async function ensureAttractionSlots(attractionId: string) {
    try {
        const attraction = await prisma.attraction.findUnique({
            where: { id: attractionId },
            include: { products: true }
        });

        if (!attraction || !attraction.bookingWindow || attraction.bookingWindow <= 0) {
            return;
        }

        // Get current Moscow time/date
        const moscowTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Moscow", hour12: false }).replace(' ', ' ').substring(0, 16);
        const todayStr = moscowTime.substring(0, 10); // "YYYY-MM-DD"

        // Check if slots are already updated today in Moscow time
        if (attraction.slotsUpdatedAt) {
            const lastUpdatedMoscow = new Date(attraction.slotsUpdatedAt)
                .toLocaleString("sv-SE", { timeZone: "Europe/Moscow", hour12: false })
                .substring(0, 10);
            if (lastUpdatedMoscow === todayStr) {
                // Already synchronized today, skip DB writes
                return;
            }
        }

        // Generate open dates in the booking window
        const [year, month, day] = todayStr.split('-').map(Number);
        const openDates: string[] = [];

        // Support string or number formats in closedDays JSON
        const closedDaysArr = Array.isArray(attraction.closedDays) ? (attraction.closedDays as any[]) : [];
        const bookingWindow = attraction.bookingWindow;

        for (let i = 0; i < bookingWindow; i++) {
            const d = new Date(Date.UTC(year, month - 1, day));
            d.setUTCDate(d.getUTCDate() + i);
            
            const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const isClosed = closedDaysArr.some(cd => String(cd) === String(dayOfWeek));
            
            if (isClosed) {
                continue; // Rest/closed day
            }

            const yStr = d.getUTCFullYear();
            const mStr = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dStr = String(d.getUTCDate()).padStart(2, '0');
            openDates.push(`${yStr}-${mStr}-${dStr}`);
        }

        const interval = attraction.slotInterval || 60;
        const startT = attraction.startTime || "09:00";
        const endT = attraction.endTime || "18:00";

        // Filter products of type ATTRACTION
        const attractionProducts = attraction.products.filter(p => p.type === 'ATTRACTION');

        // Update each product's availableSlots
        for (const product of attractionProducts) {
            let productSlots: string[] = [];
            const customTimes = Array.isArray(product.slotTimes) ? (product.slotTimes as string[]) : [];

            if (customTimes.length > 0) {
                // Generate slots by pairing open dates with custom product times
                for (const dateStr of openDates) {
                    for (const timeStr of customTimes) {
                        productSlots.push(`${dateStr} ${timeStr.trim()}`);
                    }
                }
            } else {
                // Generate slots using attraction-wide defaults
                for (const dateStr of openDates) {
                    const [startH, startM] = startT.split(':').map(Number);
                    const [endH, endM] = endT.split(':').map(Number);
                    
                    let currentMinutes = startH * 60 + startM;
                    const endMinutes = endH * 60 + endM;

                    while (currentMinutes <= endMinutes) {
                        const h = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
                        const m = String(currentMinutes % 60).padStart(2, '0');
                        productSlots.push(`${dateStr} ${h}:${m}`);
                        currentMinutes += interval;
                    }
                }
            }

            const sortedSlots = productSlots.sort();
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    availableSlots: sortedSlots
                }
            });
        }

        // Mark attraction slots as updated today
        await prisma.attraction.update({
            where: { id: attractionId },
            data: {
                slotsUpdatedAt: new Date()
            }
        });

        console.log(`Auto-populated slots for Attraction "${attraction.name}" (${attractionId}) across ${attractionProducts.length} products.`);
    } catch (error) {
        console.error(`Error in ensureAttractionSlots for attraction ${attractionId}:`, error);
    }
}
