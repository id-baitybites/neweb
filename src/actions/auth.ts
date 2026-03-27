'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth'
import { resolveTenant } from '@/lib/tenant'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
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

    if (!user) {
        console.warn(`[Login] No user found for email: ${email}`)
        return { error: 'User not found' }
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) return { error: 'Invalid password' }

    console.log(`[Login] Success: User ${user.email} Role ${user.role}`)
    
    // Update lastLogin tracking
    await (prisma.user.update as any)({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    })
    
    const cookieStore = await cookies()
    const token = generateToken({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId })
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return { success: true, role: user.role }
}

export const register = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    if (!email || !password || !name) return { error: 'Nama, email, dan password wajib diisi.' }

    const tenant = await resolveTenant()

    if (!tenant) {
        const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
        if (adminCount > 0) return { error: 'No active store found for registration.' }
    }

    const tenantId = tenant?.id ?? null

    const existingUser = await prisma.user.findFirst({
        where: { email, tenantId }
    })

    if (existingUser) return { error: 'Email sudah terdaftar di toko ini.' }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: tenantId ? 'CUSTOMER' : 'SUPER_ADMIN',
            tenantId,
            // @ts-ignore -- Prisma types stale; profile relation added via db push
            profile: {
                create: {
                    phone: phone || null,
                }
            }
        },
    })

    const cookieStore = await cookies()
    const token = generateToken({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId })
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return { success: true, role: user.role }
}

export const registerMerchant = async (formData: FormData) => {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const ownerName = formData.get('ownerName') as string
    const planRaw = (formData.get('plan') as string) || 'FREE'
    const plan = planRaw.toUpperCase()

    if (!name || !slug || !email || !password || !ownerName) {
        return { error: 'Semua field wajib diisi.' }
    }

    try {
        const reserved = ['admin', 'super-admin', 'api', 'login', 'register', 'pricing', 'onboarding']
        if (reserved.includes(slug)) return { error: 'Slug URL ini tidak bisa digunakan.' }

        const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
        if (existingTenant) return { error: 'Alamat Store (URL) sudah digunakan.' }

        const existingUser = await prisma.user.findFirst({ where: { email } })
        if (existingUser) return { error: 'Email sudah terdaftar di platform kami.' }

        const hashedPassword = await hashPassword(password)

        const result = await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    plan: plan as any,
                    theme: {
                        primary: '#FF69B4', secondary: '#1a1a1a', accent: '#4CAF50',
                        background: '#0a0a0a', font: 'Inter'
                    },
                    config: {
                        currency: 'Rp', language: 'id', deliveryFee: 0, minPreOrderDays: 1
                    }
                }
            })

            const newOwner = await tx.user.create({
                data: {
                    name: ownerName, email, password: hashedPassword,
                    role: 'OWNER', tenantId: newTenant.id
                }
            })

            return { newTenant, newOwner }
        })

        const cookieStore = await cookies()
        const token = generateToken({ 
            id: result.newOwner.id, email: result.newOwner.email, 
            role: result.newOwner.role, tenantId: result.newOwner.tenantId 
        })
        cookieStore.set('token', token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, path: '/',
        })

        return { success: true, slug: result.newTenant.slug }
    } catch (error: any) {
        console.error('Merchant Registration Error:', error)
        return { error: error.message || 'Gagal mendaftarkan store. Silakan hubungi support.' }
    }
}

export const updateCustomerProfile = async (formData: FormData) => {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) return { error: 'Belum login.' }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const gender = formData.get('gender') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const addressLine = formData.get('addressLine') as string
    const city = formData.get('city') as string
    const province = formData.get('province') as string
    const postalCode = formData.get('postalCode') as string
    const notes = formData.get('notes') as string
    const preferredPayment = formData.get('preferredPayment') as string

    const imageFile = formData.get('image') as File | null
    let imageUrl: string | undefined

    try {
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer())
            imageUrl = await uploadImageToCloudinary(buffer, 'profiles')
        }

        await (prisma.user.update as any)({
            where: { id: sessionUser.id },
            data: { 
                name,
                image: imageUrl || undefined
            }
        })

        // @ts-ignore -- Prisma types stale; CustomerProfile model added via db push
        await (prisma as any).customerProfile.upsert({
            where: { userId: sessionUser.id },
            update: {
                phone, gender, addressLine, city, province, postalCode, notes, preferredPayment,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            },
            create: {
                userId: sessionUser.id,
                phone, gender, addressLine, city, province, postalCode, notes, preferredPayment,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            }
        })

        return { success: true }
    } catch (error: any) {
        console.error('Profile update error:', error)
        return { error: error.message }
    }
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
