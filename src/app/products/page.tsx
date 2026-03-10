import { prisma } from '@/lib/prisma'
import { resolveTenant } from '@/lib/tenant'
import ModernProductList from '@/components/ModernProductList'

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Menu | StoreOS',
    description: 'View all our products',
}

export default async function ProductsPage() {
    const tenant = await resolveTenant()

    let products: any[] = []
    if (tenant) {
        products = await prisma.product.findMany({
            where: { tenantId: tenant.id, isActive: true },
            orderBy: { createdAt: 'desc' },
        })
    }

    // Set up layout container classes defined in SCSS
    return (
        <div style={{ backgroundColor: '#F8F9FA' }}>
            <div className="container" style={{ margin: '0 auto', maxWidth: '1440px' }}>
                <ModernProductList products={products} />
            </div>
        </div>
    )
}
