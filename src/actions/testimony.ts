'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'

export async function submitTestimony(tenantId: string, content: string, rating: number) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: 'Please login to submit a testimony' }
    }
    if (user.role === 'SUPER_ADMIN') {
        return { error: 'Admins cannot review' }
    }

    // Add testimony
    await prisma.testimony.create({
        data: {
            tenantId,
            userId: user.id,
            content,
            rating,
            isPublished: false // needs admin approval
        }
    })

    return { success: true }
}

export async function approveTestimony(id: string) {
    const user = await getCurrentUser()
    if (!user || user.role === 'CUSTOMER') {
        return { error: 'Unauthorized' }
    }

    await prisma.testimony.update({
        where: { id },
        data: { isPublished: true }
    })

    return { success: true }
}
