import { NextResponse } from "next/server";
import { importMariinskyTickets } from "@/lib/tickets/mariinsky";

export async function POST() {
    const result = await importMariinskyTickets();
    if (result.success) {
        return NextResponse.json({ count: result.count });
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}
