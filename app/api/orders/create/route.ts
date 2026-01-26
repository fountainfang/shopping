import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Changed from @/lib/prisma to match relative path or alias
import { redirect } from "next/navigation";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Parse JSON body
        const body = await req.json();
        const { productId, bookingDate, targetLink, additionalInfo } = body;

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const userId = session.user.id; // User ID from session (check next-auth types)

        // Transaction: Check User Balance, Check Product Stock, Deduct, Create Order
        await prisma.$transaction(async (tx) => {
            // 1. Get User
            const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

            // 2. Get Product
            const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

            // 3. Checks
            if (product.stock <= 0 && product.type !== 'CONCIERGE') { // Concierge might use infinite stock logic or just standard
                // Assuming standard stock for all for now, or skip check if needed
            }
            if (product.stock <= 0) {
                throw new Error("Product out of stock");
            }

            if (user.balance < product.price) {
                throw new Error("Insufficient balance");
            }

            // 4. Update
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: product.price } }
            });

            await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: 1 } }
            });

            await tx.order.create({
                data: {
                    userId,
                    productId,
                    price: product.price,
                    status: "paid", // Instant delivery logic
                    bookingDate: bookingDate ? new Date(bookingDate) : undefined,
                    targetLink: targetLink || undefined,
                    additionalInfo: additionalInfo || undefined
                }
            });
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Order creation error:", error);
        // Return error page or JSON (if using client fetch)
        // For form action, robust error handling usually involves redirecting to error page
        return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
    }
}
