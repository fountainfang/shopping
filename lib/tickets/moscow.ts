import { NormalizedEvent, formatSlot } from "./adapter";

// Raw type from moscow.json (partial)
interface MoscowRawItem {
    showId: number;
    showName: string;
    showForeignName: string | null;
    description: string | null;
    hallName: string;
    hallForeignName: string | null;
    minPrice: number;
    specDate: string; // "2026-01-27"
    startTime: string; // "18:00:00"
}

export function normalizeMoscowEvent(item: MoscowRawItem): NormalizedEvent {
    return {
        importId: String(item.showId),
        title: item.showForeignName || item.showName, // Prefer English
        titleRu: item.showName,
        description: item.description || "",
        theater: "Bolshoi Theater", // Hardcoded as per context (moscow.json seems to comprise Bolshoi events based on "Historic Stage")
        hall: item.hallForeignName || item.hallName,
        minPrice: item.minPrice,

        date: item.specDate,
        time: item.startTime,
        fullIsoDate: new Date(`${item.specDate}T${item.startTime}`).toISOString()
    };
}
