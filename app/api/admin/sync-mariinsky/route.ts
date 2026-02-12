import { NextResponse } from "next/server";
import { importMariinskyTickets } from "@/lib/tickets/mariinsky";
import fs from "fs/promises";
import path from "path";

const MARIINSKY_WORKER_URL = "https://mariinsky.fountain-fang.workers.dev/";
const ATTRACTION_ID = "cmkx4nn74000112wyez0cx8nr";

export async function POST() {
    try {
        // 1. Fetch latest data from the Cloudflare Worker
        const response = await fetch(MARIINSKY_WORKER_URL);
        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch from worker: ${response.status} ${response.statusText}` },
                { status: 502 }
            );
        }

        const data = await response.json();

        // 2. Save to mariinsky_raw.json
        const filePath = path.join(process.cwd(), "mariinsky_raw.json");
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

        // 3. Run the import (links to the Mariinsky attraction)
        const result = await importMariinskyTickets(ATTRACTION_ID);

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
        console.error("Mariinsky sync error:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
