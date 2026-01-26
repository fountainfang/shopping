import { importBolshoiTickets } from "../lib/tickets/bolshoi";

async function main() {
    console.log("Starting Bolshoi Import Test...");
    const result = await importBolshoiTickets();
    console.log("Result:", result);
}

main().catch(console.error);
