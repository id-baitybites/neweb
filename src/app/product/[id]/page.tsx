import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'

interface Props {
    params: {
        id: string
    }
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    return <ProductDetailClient product={product} />
}
