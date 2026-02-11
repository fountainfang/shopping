import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface WorkerPriceResponse {
    "不走淘宝价格": number
    "淘宝价格": number
    "美元价格": number
    "人民币usdt汇率": number
}

export function useWorkerPrice(amount: number | null | undefined) {
    const { data, error, isLoading } = useSWR<WorkerPriceResponse>(
        amount ? `https://lolzteam.fountain-fang.workers.dev/?amount=${amount}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // Cache for 1 minute
        }
    )

    return {
        prices: data,
        isLoading,
        isError: error,
    }
}
