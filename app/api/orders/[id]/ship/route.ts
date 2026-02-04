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

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "completed",
                deliveryContent: deliveryContent
            }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Order ship error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
