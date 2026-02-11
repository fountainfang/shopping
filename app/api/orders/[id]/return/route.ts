
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orderId = params.id;

        // Transaction for refund safety
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUniqueOrThrow({
                where: { id: orderId },
                include: { product: true }
            });

            if (order.status === 'refunded') {
                throw new Error("Order already refunded");
            }

            // 1. Refund Balance
            await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: order.price } }
            });

            // 2. Restore Stock (If not concierge/service type logic, assuming standard products have stock)
            // Concierge usually doesn't have stock management in the same way, but let's be safe.
            if (order.product.type !== 'CONCIERGE') {
                await tx.product.update({
                    where: { id: order.productId },
                    data: { stock: { increment: 1 } }
                });
            }

            // 3. Mark Order Refunded
            await tx.order.update({
                where: { id: orderId },
                data: { status: "refunded" }
            });

            // 4. Record Transaction
            await tx.transaction.create({
                data: {
                    userId: order.userId,
                    amount: order.price,
                    asset: "REFUND",
                    txHash: `REFUND-${order.id}-${Date.now()}`, // Internal tracking hash
                    status: "completed"
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Order refund error:", error);
        return NextResponse.json({ error: error.message || "Failed to refund order" }, { status: 500 });
    }
}
