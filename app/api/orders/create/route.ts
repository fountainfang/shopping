import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkerPrice } from "@/lib/price";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Parse JSON body
        const body = await req.json();
        const { productId, bookingDate, targetLink, additionalInfo } = body;

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        if (!session.user.id) {
            return NextResponse.json({ error: "User ID missing from session" }, { status: 401 });
        }
        const userId = session.user.id;

        // Transaction: Check User Balance, Check Product Stock, Deduct, Create Order
        const createdOrder = await prisma.$transaction(async (tx) => {
            // 1. Get User
            const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

            // 2. Get Product
            const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

            // 3. Checks
            let finalPrice = product.price;

            if (product.type === 'CONCIERGE') {
                if (body.price && typeof body.price === 'number') {
                    finalPrice = body.price;
                }
                // Optional: You could re-verify with the worker API here for security
            } else {
                // Standard Product: Price in DB is RUB. We need to deduct USDT.
                // Fetch dynamic USD price from worker
                try {
                    // We trust the worker to give us the USDT equivalent
                    const usdPrice = await getWorkerPrice(product.price);
                    finalPrice = usdPrice;
                } catch (error) {
                    console.error("Failed to get worker price for order", error);
                    throw new Error("Failed to calculate price. Please try again.");
                }
            }

            if (product.stock <= 0 && product.type !== 'CONCIERGE') {
                throw new Error("Product out of stock");
            }

            if (user.balance < finalPrice) {
                throw new Error("Insufficient balance");
            }

            // 4. Update balance
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: finalPrice } }
            });

            // 5. Update stock & CDK pool if POOL mode
            if (product.type !== 'CONCIERGE') {
                if (product.type === 'AUTO_DELIVERY' && product.autoDeliveryType === 'POOL') {
                    const pool = (product.cdkPool as string[]) || [];
                    if (pool.length === 0) {
                        throw new Error("Product out of stock");
                    }
                    const newPool = pool.slice(1);
                    await tx.product.update({
                        where: { id: productId },
                        data: {
                            cdkPool: newPool,
                            stock: newPool.length
                        }
                    });
                } else {
                    await tx.product.update({
                        where: { id: productId },
                        data: { stock: { decrement: 1 } }
                    });
                }
            }

            // 6. Determine status and deliveryContent for the order
            let status = "paid";
            let deliveryContent: string | null = null;

            if (product.type === 'AUTO_DELIVERY') {
                if (product.autoDeliveryType === 'FIXED') {
                    deliveryContent = product.content;
                    status = "completed";
                } else if (product.autoDeliveryType === 'POOL') {
                    const pool = (product.cdkPool as string[]) || [];
                    if (pool.length > 0) {
                        deliveryContent = pool[0];
                        status = "completed";
                    }
                }
            }

            return await tx.order.create({
                data: {
                    userId,
                    productId,
                    price: finalPrice,
                    status,
                    deliveryContent,
                    bookingDate: bookingDate ? new Date(bookingDate) : undefined,
                    targetLink: targetLink || undefined,
                    additionalInfo: additionalInfo || undefined
                }
            });
        });

        // Outside the transaction block, if API delivery is configured, call it
        if (createdOrder && createdOrder.status === "paid") {
            const product = await prisma.product.findUnique({
                where: { id: createdOrder.productId },
                select: { type: true, autoDeliveryType: true, apiDeliveryUrl: true }
            });

            if (product && product.type === "AUTO_DELIVERY" && product.autoDeliveryType === "API" && product.apiDeliveryUrl) {
                try {
                    const separator = product.apiDeliveryUrl.includes('?') ? '&' : '?';
                    const targetUrl = `${product.apiDeliveryUrl}${separator}orderId=${createdOrder.id}&productId=${createdOrder.productId}`;
                    
                    console.log(`Auto-Delivery API request to: ${targetUrl}`);
                    const response = await fetch(targetUrl, {
                        method: "GET",
                        headers: { "Accept": "application/json, text/plain, */*" }
                    });

                    if (!response.ok) {
                        throw new Error(`API returned status ${response.status}`);
                    }

                    const contentType = response.headers.get("content-type") || "";
                    let content = "";
                    if (contentType.includes("application/json")) {
                        const json = await response.json();
                        content = json.code || json.cdk || json.content || json.data || JSON.stringify(json);
                    } else {
                        content = await response.text();
                    }

                    await prisma.order.update({
                        where: { id: createdOrder.id },
                        data: {
                            status: "completed",
                            deliveryContent: content.trim()
                        }
                    });
                    console.log(`Auto-Delivery API success for order ${createdOrder.id}`);
                } catch (apiError: any) {
                    console.error("Auto-Delivery API failure:", apiError);
                    await prisma.order.update({
                        where: { id: createdOrder.id },
                        data: {
                            additionalInfo: `API auto-delivery failed: ${apiError.message || apiError}. Manual delivery required.`
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Order creation error:", error);
        // Return error page or JSON (if using client fetch)
        // For form action, robust error handling usually involves redirecting to error page
        return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
    }
}
