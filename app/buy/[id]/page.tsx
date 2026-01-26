import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ClientBuyPage from "@/components/ClientBuyPage"
import { notFound, redirect } from "next/navigation"

export default async function BuyPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    // In a real app, you might allow non-logged in users to see the page,
    // but here we want to show balance, so being logged in is helpful, 
    // although ClientBuyPage handles the "not logged in" state gracefully too.

    const product = await prisma.product.findUnique({
        where: { id: params.id }
    })

    if (!product) {
        notFound()
    }

    let userBalance = 0;
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })
        userBalance = user?.balance || 0
    }

    return <ClientBuyPage product={product} session={session} userBalance={userBalance} />
}
