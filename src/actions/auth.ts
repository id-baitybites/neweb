'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth'
import { resolveTenant } from '@/lib/tenant'
type Role = 'CUSTOMER' | 'STAFF' | 'OWNER' | 'SUPER_ADMIN'

export const login = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: 'Email and password are required' }

    const tenant = await resolveTenant()

    // Look for user matching email and either belonging to current tenant OR is a super admin
    const user = await prisma.user.findFirst({
        where: {
            email,
            OR: [
                { tenantId: tenant?.id ?? 'invalid-id' },
                { tenantId: null } // SUPER_ADMIN
            ]
        }
    })

    if (!user) return { error: 'User not found' }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) return { error: 'Invalid password' }

    const cookieStore = await cookies()
    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })

    return { success: true, role: user.role }
}

export const register = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password) return { error: 'Email and password are required' }

    const tenant = await resolveTenant()

    // Safety check - cannot register without a tenant unless system is completely empty
    if (!tenant) {
        const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
        if (adminCount > 0) return { error: 'No active store found for registration.' }
    }

    const tenantId = tenant?.id ?? null

    const existingUser = await prisma.user.findFirst({
        where: { email, tenantId }
    })

    if (existingUser) return { error: 'User already exists' }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: tenantId ? 'CUSTOMER' : 'SUPER_ADMIN', // Empty system bootstrapping
            tenantId,
        },
    })

    const cookieStore = await cookies()
    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return { success: true, role: user.role }
}

export const logout = async () => {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    return { success: true }
}

export const getCurrentUser = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    try {
        return await verifyToken(token)
    } catch (error) {
        return null
    }
}
