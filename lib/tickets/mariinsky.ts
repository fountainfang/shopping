import { NormalizedEvent } from "./adapter";

interface MariinskyRawItem {
    date: string;       // "26"
    month: string;      // "January"
    location: string;   // "Mariinsky Theatre"
    time: string;       // "19:00"
    summary: string;    // Title "Die Entführung aus dem Serail"
    description: string;
}

const MONTH_MAP: Record<string, string> = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
};

export function normalizeMariinskyEvent(item: MariinskyRawItem): NormalizedEvent {
    // Assume 2026 for now as per context of moscow.json
    const year = "2026";
    const monthNum = MONTH_MAP[item.month] || "01";
    const dayNum = item.date.padStart(2, '0');

    // Construct ISO Date: YYYY-MM-DD
    const isoDate = `${year}-${monthNum}-${dayNum}`;

    // Unique ID generation (since source lacks ID)
    // simplistic hash or just combine fields
    const importId = `mar-${isoDate}-${item.time}-${item.location}-${item.summary}`.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    return {
        importId,
        title: item.summary,
        titleRu: item.summary, // Mariinsky JSON seems to give English/Latin titles in summary. We might not have Ru title here easily.
        description: item.description,
        theater: "Mariinsky Theater",
        hall: item.location,    // "Mariinsky II", "Concert Hall", etc.
        minPrice: 0,            // Price not available in this feed

        date: isoDate,
        time: item.time,
        fullIsoDate: new Date(`${isoDate}T${item.time}:00`).toISOString()
    };
}
