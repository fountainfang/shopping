import { NextResponse } from "next/server";
import { importBolshoiTickets } from "@/lib/tickets/bolshoi";

const ATTRACTION_ID = "cmkx46bsp000012wyav5tt5op";

export async function POST() {
    try {
        const result = await importBolshoiTickets(ATTRACTION_ID);

        if (result.success) {
            return NextResponse.json({
                success: true,
                count: result.count,
                message: `Synced successfully. ${result.count} new products created.`
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("Bolshoi sync error:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
