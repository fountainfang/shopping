import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAttractionSlots } from "@/lib/slots";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const attractionId = searchParams.get('attractionId');

    try {
        const whereClause: any = {};
        if (attractionId) {
            whereClause.attractionId = attractionId;
        } else {
            // Optional: prevent returning EVERYTHING if not needed, or limit it.
            // For now, if no ID, return empty or limit 50?
            // The user specifically wants to filter by attraction.
            // Let's restrict to having attractionId if that's the main use case, 
            // or just return all if we want general search later.
            // Let's return empty if no filter to save bandwidth for now as this is specific.
            return NextResponse.json([]);
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                titleZh: true,
                titleRu: true,
                description: true,
                descriptionZh: true,
                descriptionRu: true,
                price: true,
                type: true,
                location: true,
                venue: true,
                city: true,
                cityZh: true,
                cityRu: true
            },
            take: 50
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Fetch Products Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    console.log("Admin Create Product: Session Check:", JSON.stringify(session, null, 2));

    if (!session || !session.user || session.user.role !== "admin") {
        console.log("Admin Create Product: UNAUTHORIZED. Role:", session?.user?.role);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        console.log("Admin Create Product: Payload:", data);

        const product = await prisma.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                stock: data.stock,
                content: data.content,

                type: data.type,
                location: data.location,
                venue: data.venue,
                city: data.city,
                cityZh: data.cityZh,
                cityRu: data.cityRu,

                titleZh: data.titleZh,
                titleRu: data.titleRu,
                descriptionZh: data.descriptionZh,
                descriptionRu: data.descriptionRu,

                googleMapLink: data.googleMapLink,
                yandexMapLink: data.yandexMapLink,
                availableSlots: data.availableSlots, // Saved as Json
                slotTimes: data.slotTimes || null,
                attractionId: data.attractionId || null,
                conciergeFields: data.conciergeFields || null,
                markupRules: data.markupRules || null,
                autoDeliveryType: data.autoDeliveryType || null,
                cdkPool: data.cdkPool || null,
                apiDeliveryUrl: data.apiDeliveryUrl || null,
            }
        });

        // Auto-generate slots immediately if product has attraction and is attraction type
        if (product.attractionId && product.type === 'ATTRACTION') {
            await prisma.attraction.update({
                where: { id: product.attractionId },
                data: { slotsUpdatedAt: null }
            });
            await ensureAttractionSlots(product.attractionId);
        }

        console.log("Admin Create Product: SUCCESS", product.id);
        return NextResponse.json(product);
    } catch (error) {
        console.error("Admin Create Product: DB ERROR:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
