'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'
import { resolveTenant } from '@/lib/tenant'

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
