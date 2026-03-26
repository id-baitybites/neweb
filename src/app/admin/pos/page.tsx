import React from 'react'
import POSClient from '@/components/admin/POSClient'
import { getDictionary } from '@/i18n'
import { resolveTenant } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export default async function AdminPOSPage() {
    const dict = await getDictionary()
    const tenant = await resolveTenant()

    if (!tenant) return <div>No active store found</div>

    const products = await prisma.product.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, name: true, price: true, imageUrl: true }
    })

    return <POSClient dict={dict} tenant={tenant} initialProducts={products} />
}
