import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getDictionary } from '@/i18n'
import ProductDetailClient from '@/components/ProductDetailClient'
import { resolveTenant } from '@/lib/tenant'

interface Props {
    params: {
        id: string
    }
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params
    const tenant = await resolveTenant()
    const product = await prisma.product.findUnique({
        where: { id }
    })
    const dict = await getDictionary()

    if (!product) {
        notFound()
    }

    return <ProductDetailClient product={product} tenant={tenant} dict={dict} />
}
