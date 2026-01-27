export interface NormalizedEvent {
    importId: string;       // Unique ID from source (e.g. "150610039603")
    title: string;          // English Name (fallback to Ru)
    titleRu: string;        // Russian Name
    description?: string;
    theater: string;        // "Bolshoi"
    minPrice: number;

    // Grouping Keys (These define a unique "Product")
    hall: string;           // "Historic Stage"

    // Instance Data (These go into availableSlots)
    date: string;           // "2026-01-27"
    time: string;           // "19:00"
    fullIsoDate: string;    // "2026-01-27T19:00:00.000Z"
}

// Helper to standardise dates
export function formatSlot(date: string, time: string): string {
    // Returns YYYY-MM-DD HH:mm
    return `${date} ${time.slice(0, 5)}`;
}
