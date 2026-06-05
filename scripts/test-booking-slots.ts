import { prisma } from "../lib/prisma"
import { ensureAttractionSlots } from "../lib/slots"

async function test() {
    console.log("=== Testing Attraction Booking Slots Auto-Population ===");

    // 1. Create a dummy attraction
    // We set booking window to 3 days, closed on Sundays (0), default slot interval 30 mins, 10:00 to 11:00
    const attraction = await prisma.attraction.create({
        data: {
            name: "Test Attraction",
            city: "Test City",
            bookingWindow: 3,
            closedDays: [0], // Sunday
            slotInterval: 30,
            startTime: "10:00",
            endTime: "11:00"
        }
    });

    console.log(`Created dummy attraction: "${attraction.name}" (ID: ${attraction.id})`);

    // 2. Create Product 1 (fallback to attraction default settings)
    const productDefault = await prisma.product.create({
        data: {
            title: "Test Default Ticket Option",
            description: "Test description",
            price: 15.0,
            type: "ATTRACTION",
            attractionId: attraction.id,
            availableSlots: []
        }
    });
    console.log(`Created dummy ticket (Default fallback): "${productDefault.title}" (ID: ${productDefault.id})`);

    // 3. Create Product 2 (custom split session slotTimes: 10:00, 11:00, 13:30, 14:30)
    const productCustom = await prisma.product.create({
        data: {
            title: "Test Custom Split-Time Ticket Option",
            description: "Test description",
            price: 25.0,
            type: "ATTRACTION",
            attractionId: attraction.id,
            availableSlots: [],
            slotTimes: ["10:00", "11:00", "13:30", "14:30"]
        }
    });
    console.log(`Created dummy ticket (Custom split times): "${productCustom.title}" (ID: ${productCustom.id})`);

    // 4. Trigger slot generation
    console.log("Calling ensureAttractionSlots...");
    await ensureAttractionSlots(attraction.id);

    // 5. Verify Product 1 (Default settings)
    const updatedProductDefault = await prisma.product.findUnique({
        where: { id: productDefault.id }
    });

    if (!updatedProductDefault) {
        throw new Error("Default Product not found after update!");
    }

    const defaultSlots = updatedProductDefault.availableSlots as string[];
    console.log("Product 1 (Default) Slots:", JSON.stringify(defaultSlots, null, 2));

    // 6. Verify Product 2 (Custom split times)
    const updatedProductCustom = await prisma.product.findUnique({
        where: { id: productCustom.id }
    });

    if (!updatedProductCustom) {
        throw new Error("Custom Product not found after update!");
    }

    const customSlots = updatedProductCustom.availableSlots as string[];
    console.log("Product 2 (Custom) Slots:", JSON.stringify(customSlots, null, 2));

    // Determine expected open & closed dates in the next 3 days
    const moscowTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Moscow", hour12: false }).replace(' ', ' ').substring(0, 16);
    const todayStr = moscowTime.substring(0, 10);
    const [year, month, day] = todayStr.split('-').map(Number);

    const expectedDates: string[] = [];
    const closedDates: string[] = [];
    
    for (let i = 0; i < 3; i++) {
        const d = new Date(Date.UTC(year, month - 1, day));
        d.setUTCDate(d.getUTCDate() + i);
        const yStr = d.getUTCFullYear();
        const mStr = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dStr = String(d.getUTCDate()).padStart(2, '0');
        const dateStr = `${yStr}-${mStr}-${dStr}`;
        
        if (d.getUTCDay() === 0) {
            closedDates.push(dateStr);
        } else {
            expectedDates.push(dateStr);
        }
    }

    let success = true;

    // Verify Product 1 (Default times: 10:00, 10:30, 11:00 on open dates)
    console.log("\n--- Verifying Product 1 (Default fallback) ---");
    for (const dStr of expectedDates) {
        const dateSlots = defaultSlots.filter(s => s.startsWith(dStr));
        const expectedTimes = ["10:00", "10:30", "11:00"];
        const actualTimes = dateSlots.map(s => s.split(' ')[1]);
        
        const hasAllTimes = expectedTimes.every(t => actualTimes.includes(t));
        if (!hasAllTimes || actualTimes.length !== expectedTimes.length) {
            console.error(`❌ Product 1: Mismatch in slots for date ${dStr}! Expected ${JSON.stringify(expectedTimes)}, got ${JSON.stringify(actualTimes)}`);
            success = false;
        } else {
            console.log(`✅ Product 1: Slots for open date ${dStr} are correct.`);
        }
    }

    // Verify Product 2 (Custom split times: 10:00, 11:00, 13:30, 14:30 on open dates)
    console.log("\n--- Verifying Product 2 (Custom split times) ---");
    for (const dStr of expectedDates) {
        const dateSlots = customSlots.filter(s => s.startsWith(dStr));
        const expectedTimes = ["10:00", "11:00", "13:30", "14:30"];
        const actualTimes = dateSlots.map(s => s.split(' ')[1]);
        
        const hasAllTimes = expectedTimes.every(t => actualTimes.includes(t));
        if (!hasAllTimes || actualTimes.length !== expectedTimes.length) {
            console.error(`❌ Product 2: Mismatch in slots for date ${dStr}! Expected ${JSON.stringify(expectedTimes)}, got ${JSON.stringify(actualTimes)}`);
            success = false;
        } else {
            console.log(`✅ Product 2: Slots for open date ${dStr} are correct.`);
        }
    }

    // Check that closed dates have no slots for either product
    console.log("\n--- Verifying Closed Days (Sundays) ---");
    for (const dStr of closedDates) {
        const defaultDateSlots = defaultSlots.filter(s => s.startsWith(dStr));
        const customDateSlots = customSlots.filter(s => s.startsWith(dStr));
        
        if (defaultDateSlots.length > 0) {
            console.error(`❌ Product 1: Closed date ${dStr} (Sunday) has slots: ${JSON.stringify(defaultDateSlots)}!`);
            success = false;
        } else {
            console.log(`✅ Product 1: Closed date ${dStr} correctly has no slots.`);
        }

        if (customDateSlots.length > 0) {
            console.error(`❌ Product 2: Closed date ${dStr} (Sunday) has slots: ${JSON.stringify(customDateSlots)}!`);
            success = false;
        } else {
            console.log(`✅ Product 2: Closed date ${dStr} correctly has no slots.`);
        }
    }

    // 7. Clean up
    console.log("\nCleaning up test data...");
    await prisma.product.delete({ where: { id: productDefault.id } });
    await prisma.product.delete({ where: { id: productCustom.id } });
    await prisma.attraction.delete({ where: { id: attraction.id } });
    console.log("Clean up done.");

    if (success) {
        console.log("🎉 All tests PASSED successfully!");
    } else {
        console.log("❌ Test FAILED!");
        process.exit(1);
    }
}

test()
    .catch(err => {
        console.error("Test error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
