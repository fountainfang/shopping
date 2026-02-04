import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            name, nameZh, nameRu,
            description, descriptionZh, descriptionRu,
            city, cityZh, cityRu,
            image, googleMapLink, yandexMapLink
        } = body

        if (!name || !city) {
            return NextResponse.json({ error: "Name and City are required" }, { status: 400 })
        }

        const attraction = await prisma.attraction.create({
            data: {
                name, nameZh, nameRu,
                description, descriptionZh, descriptionRu,
                city, cityZh, cityRu,
                image, googleMapLink, yandexMapLink
            }
        })

        return NextResponse.json(attraction)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    // Publicly accessible for listing? Or Admin only?
    // Let's make it admin only for this route, and public via a different logic if needed,
    // or just public since it's GET.
    // Usually admin lists need all data.

    // For now, let's just return all.
    const attractions = await prisma.attraction.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attractions)
}
