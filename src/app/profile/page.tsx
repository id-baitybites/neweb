import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import ProfileClient from '@/components/customer/ProfileClient'

export default async function ProfilePage() {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) redirect('/login?returnUrl=/profile')

    if (sessionUser.role === 'SUPER_ADMIN') redirect('/super-admin')
    if (sessionUser.role === 'OWNER' || sessionUser.role === 'STAFF') redirect('/admin')

    // @ts-ignore -- CustomerProfile relation added via db push; types catch up on next restart
    const user = await (prisma.user.findUnique as any)({
        where: { id: sessionUser.id },
        include: {
            profile: true,
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    orderItems: { include: { product: true } }
                }
            }
        }
    })

    if (!user) redirect('/login')

    const u = user as any
    const serializedUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        profile: u.profile ? {
            ...u.profile,
            dateOfBirth: u.profile.dateOfBirth?.toISOString() ?? null,
            createdAt: u.profile.createdAt.toISOString(),
            updatedAt: u.profile.updatedAt.toISOString(),
        } : null,
        orders: (u.orders ?? []).map((o: any) => ({
            ...o,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
        }))
    }

    return <ProfileClient user={serializedUser} />
}
