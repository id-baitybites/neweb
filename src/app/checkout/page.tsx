import React from 'react'
import { resolveTenant } from '@/lib/tenant'
import CheckoutContent from '@/components/checkout/CheckoutContent'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { prisma } from '@/lib/prisma'
import { getDictionary } from '@/i18n'

export default async function CheckoutPage() {
    const tenant = await resolveTenant()
    const dict = await getDictionary()

    if (!tenant) redirect('/')

    // Optionally pre-fill checkout form for logged-in customers
    let customerProfile = null
    const sessionUser = await getCurrentUser()
    if (sessionUser) {
        const user = await (prisma.user.findUnique as any)({
            where: { id: sessionUser.id },
            include: { profile: true }
        })
        if (user) {
            const p = user.profile
            customerProfile = {
                name: user.name,
                email: user.email,
                phone: p?.phone ?? null,
                addressLine: p?.addressLine ?? null,
                city: p?.city ?? null,
                postalCode: p?.postalCode ?? null,
                notes: p?.notes ?? null,
            }
        }
    }

    return (
        <CheckoutContent tenant={tenant} customerProfile={customerProfile} dict={dict} />
    )
}
