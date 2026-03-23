import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import ModernProductList from '@/components/ModernProductList'
import { getDictionary } from '@/i18n'
import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Produk | Bitespace Platform',
    description: 'Lihat daftar merchant di platform kami',
}

export default async function ProductsPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()

    if (!tenant) {
        // Redirect globally to merchant directory
        console.warn('[ProductsPage] No tenant resolved at root, redirecting to merchant list...')
        redirect('/#merchants')
    }

    const products = await prisma.product.findMany({
        where: { tenantId: tenant.id, isActive: true },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div style={{ backgroundColor: '#F8F9FA' }}>
            <div className="container" style={{ margin: '0 auto', maxWidth: '1440px' }}>
                <ModernProductList products={products} dictionary={dict} />
            </div>
        </div>
    )
}
