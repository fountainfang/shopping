import { NextResponse } from "next/server";
import { importMikhailovskyTickets } from "@/lib/tickets/mikhailovsky";
import fs from "fs/promises";
import path from "path";

const MIKHAILOVSKY_WORKER_URL = "https://mikhailovsky.fountain-fang.workers.dev/";
const ATTRACTION_ID = "cmlihj7gy00001r7w57s9wf8o";

export async function POST() {
    try {
        // 1. Fetch latest data from the Cloudflare Worker (can be slow, up to 30s)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        let response: Response;
        try {
            response = await fetch(MIKHAILOVSKY_WORKER_URL, {
                signal: controller.signal
            });
        } catch (err: any) {
            clearTimeout(timeout);
            if (err.name === "AbortError") {
                return NextResponse.json(
                    { error: "Request to Mikhailovsky worker timed out (60s)" },
                    { status: 504 }
                );
            }
            throw err;
        }
        clearTimeout(timeout);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch from worker: ${response.status} ${response.statusText}` },
                { status: 502 }
            );
        }

        const data = await response.json();

        // 2. Save to mikhailovsky.json
        const filePath = path.join(process.cwd(), "mikhailovsky.json");
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

        // 3. Run the import (links to the Mikhailovsky attraction)
        const result = await importMikhailovskyTickets(ATTRACTION_ID);

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
        console.error("Mikhailovsky sync error:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
