
export async function getWorkerPrice(amount: number): Promise<number> {
    try {
        const res = await fetch(`https://lolzteam.fountain-fang.workers.dev/?amount=${amount}`, {
            next: { revalidate: 60 } // Cache for 1 minute on server side too
        })

        if (!res.ok) {
            throw new Error(`Worker API failed: ${res.status}`)
        }

        const data = await res.json()
        // Return "美元价格" as the standard USDT price
        return data["美元价格"]
    } catch (error) {
        console.error("Failed to fetch worker price:", error)
        // Fallback logic if worker fails? 
        // For now, simple fallback might be dangerous if rates fluctuate wildly.
        // Let's fallback to specific hardcoded rate if absolutely necessary, but throwing error is safer for now.
        throw error
    }
}
