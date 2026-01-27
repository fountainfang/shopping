import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { OrderList } from "@/components/dashboard/OrderList"

export const dynamic = 'force-dynamic'

async function getOrders(userId: string) {
    return await prisma.order.findMany({
        where: {
            userId: userId
        },
        include: {
            product: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export default async function OrdersPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/auth/login")
    }

    const orders = await getOrders(session.user.id)

    return <OrderList orders={orders} />
}
