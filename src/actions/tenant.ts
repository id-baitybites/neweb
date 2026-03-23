'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'
import { resolveTenant } from '@/lib/tenant'
import bcrypt from 'bcryptjs'

export async function updateTenantAction(id: string, formData: FormData) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized. Super Admin only.' }
    }

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const domain = formData.get('domain') as string || null
    const plan = formData.get('plan') as any
    const isActive = formData.get('isActive') === 'true'

    try {
        await prisma.tenant.update({
            where: { id },
            data: {
                name,
                slug,
                domain,
                plan,
                isActive
            }
        })
        revalidatePath(`/super-admin/tenants/${id}`)
        revalidatePath('/super-admin')
        return { success: true, message: 'Merchant updated successfully' }
    } catch (error: any) {
        console.error('Tenant update error:', error)
        return { error: error.message || 'Failed to update merchant' }
    }
}

export async function deleteTenantAction(id: string) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized. Super Admin only.' }
    }

    try {
        // Cascade delete will handle products, orders etc. via prisma schema 
        // if relations are configured with onDelete: Cascade
        await prisma.tenant.delete({
            where: { id }
        })
        revalidatePath('/super-admin')
        return { success: true, message: 'Merchant deleted successfully' }
    } catch (error: any) {
        console.error('Tenant delete error:', error)
        return { error: error.message || 'Failed to delete merchant' }
    }
}

export async function updateTenantSettings(formData: FormData) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'OWNER' && user.role !== 'STAFF' && user.role !== 'SUPER_ADMIN')) {
        return { error: 'Unauthorized.' }
    }

    const tenant = await resolveTenant()
    if (!tenant) return { error: 'No tenant found.' }

    const logoUrl = formData.get('logoUrl') as string
    const theme = JSON.parse(formData.get('theme') as string)
    const config = JSON.parse(formData.get('config') as string)

    try {
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                logoUrl,
                theme,
                config
            }
        })
        revalidatePath('/admin/settings')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Tenant settings update error:', error)
        return { error: error.message || 'Failed to update settings' }
    }
}

export async function createTenant(formData: FormData) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized.' }
    }

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const domain = (formData.get('domain') as string) || null
    const plan = formData.get('plan') as any
    const ownerName = formData.get('ownerName') as string
    const ownerEmail = formData.get('ownerEmail') as string
    const ownerPassword = formData.get('ownerPassword') as string

    if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
        return { error: 'Missing required fields.' }
    }

    try {
        // Check if slug exists
        const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
        if (existingTenant) return { error: 'Slug already taken.' }

        // Check if email exists (Global check for now for new owners)
        const existingUser = await prisma.user.findFirst({ 
            where: { email: ownerEmail } 
        })
        if (existingUser) return { error: 'Email already registered.' }

        const hashedPassword = await bcrypt.hash(ownerPassword, 10)

        // Transactional creation
        const result = await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    domain,
                    plan,
                    theme: {
                        primary: '#FF69B4',
                        secondary: '#1a1a1a',
                        accent: '#4CAF50',
                        background: '#0a0a0a',
                        font: 'Inter'
                    },
                    config: {
                        currency: 'Rp',
                        language: 'id',
                        deliveryFee: 0,
                        minPreOrderDays: 1
                    }
                }
            })

            const newOwner = await tx.user.create({
                data: {
                    name: ownerName,
                    email: ownerEmail,
                    password: hashedPassword,
                    role: 'OWNER',
                    tenantId: newTenant.id
                }
            })

            return { newTenant, newOwner }
        })

        revalidatePath('/super-admin')
        return { success: true }
    } catch (error: any) {
        console.error('Create tenant error:', error)
        return { error: error.message || 'Failed to create merchant.' }
    }
}
