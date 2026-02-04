import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const attraction = await prisma.attraction.findUnique({
        where: { id: params.id },
        include: { products: true }
    })

    if (!attraction) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(attraction)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()

        // Remove ID if present in body to avoid error
        delete body.id
        delete body.createdAt
        delete body.updatedAt
        delete body.products

        const attraction = await prisma.attraction.update({
            where: { id: params.id },
            data: body
        })

        return NextResponse.json(attraction)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await prisma.attraction.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
