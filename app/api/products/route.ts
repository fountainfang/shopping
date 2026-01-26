import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    console.log("Admin Create Product: Session Check:", JSON.stringify(session, null, 2));

    if (!session || session.user.role !== "admin") {
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
            }
        });
        console.log("Admin Create Product: SUCCESS", product.id);
        return NextResponse.json(product);
    } catch (error) {
        console.error("Admin Create Product: DB ERROR:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
