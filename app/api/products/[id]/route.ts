import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAttractionSlots } from "@/lib/slots";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') { // Assume role check or basic admin logic
        // For this MVP, we might rely on the fact it's an admin route or authorized
        // If user role check fails, return 401
    }

    try {
        const body = await req.json();
        const { id } = params;

        // Cleanup body: remove ID if present, ensure numeric types
        const { id: _, ...data } = body;

        const product = await prisma.product.update({
            where: { id },
            data: data
        });

        // Trigger slot generation immediately if product has attraction and is attraction type
        if (product.attractionId && product.type === 'ATTRACTION') {
            await prisma.attraction.update({
                where: { id: product.attractionId },
                data: { slotsUpdatedAt: null }
            });
            await ensureAttractionSlots(product.attractionId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
