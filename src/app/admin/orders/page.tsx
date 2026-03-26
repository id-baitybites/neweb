import React from 'react'
import OrdersClient from '@/components/admin/OrdersClient'
import { getDictionary } from '@/i18n'
import { resolveTenant } from '@/lib/tenant'

export default async function AdminOrdersPage() {
    const dict = await getDictionary()
    const tenant = await resolveTenant()

    if (!tenant) return <div>No active store found</div>

    return <OrdersClient dict={dict} tenant={tenant} />
}
