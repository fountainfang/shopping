import { NextResponse } from "next/server";
import { importBolshoiTickets } from "@/lib/tickets/bolshoi";

export async function POST() {
    console.log("Bolshoi Import Triggered");
    const result = await importBolshoiTickets();
    if (result.success) {
        return NextResponse.json({ count: result.count });
    } else {
        console.error("API Error Result:", result);
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}
