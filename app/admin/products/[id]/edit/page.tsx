import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProductClient from "./EditProductClient"

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    });

    if (!product) {
        redirect("/admin/products");
    }

    return <EditProductClient product={product} />
}
