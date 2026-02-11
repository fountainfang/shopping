
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
        const { deliveryContent } = await req.json();

        // Update content but NOT status (unless previously null/pending, but message doesn't necessarily mean fulfilled)
        // Leaving status as is.
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                deliveryContent: deliveryContent
            }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Order message error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
