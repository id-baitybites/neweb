'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { resolveTenant } from '@/lib/tenant'

/**
 * Fetch all customers for the current tenant (Admin only) with enhanced stats
 */
export const getAdminCustomers = async () => {
    const user = await getCurrentUser()
    const tenant = await resolveTenant()
    
    // Fallback to user's tenant if URL-based resolution returns null
    const targetTenantId = tenant?.id || user?.tenantId

    // Authorization check
    const isAuthorized = user?.role === 'SUPER_ADMIN' || 
                       (targetTenantId && (user?.role === 'OWNER' || user?.role === 'STAFF') && user.tenantId === targetTenantId)

    if (!isAuthorized) {
        console.warn(`[getAdminCustomers] Unauthorized access for user ${user?.email}`)
        throw new Error("Unauthorized access")
    }

    try {
        const customers = await prisma.user.findMany({
            where: { 
                role: 'CUSTOMER',
                ...(targetTenantId ? { tenantId: targetTenantId } : {})
            },
            include: {
                profile: true,
                orders: {
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate stats
        const total = customers.length
        const active = customers.filter(c => (c as any).isActive).length
        const inactive = total - active
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const loggedInToday = customers.filter(c => (c as any).lastLogin && new Date((c as any).lastLogin) >= today).length

        return { 
            success: true, 
            customers,
            stats: {
                total,
                active,
                inactive,
                loggedInToday
            }
        }
    } catch (error: any) {
        console.error('Error fetching admin customers:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fetch detailed information for a single customer (Admin only)
 */
export const getAdminCustomerDetails = async (id: string) => {
    const user = await getCurrentUser()
    const tenant = await resolveTenant()

    // Fallback to user's tenant if URL-based resolution returns null
    const targetTenantId = tenant?.id || user?.tenantId

    // Authorization check
    const isAuthorized = user?.role === 'SUPER_ADMIN' || 
                       (targetTenantId && (user?.role === 'OWNER' || user?.role === 'STAFF') && user.tenantId === targetTenantId)

    if (!isAuthorized) {
        console.warn(`[getAdminCustomerDetails] Unauthorized access for user ${user?.email}`)
        throw new Error("Unauthorized access")
    }

    try {
        const customer = await (prisma.user.findFirst as any)({
            where: { 
                id,
                ...(targetTenantId ? { tenantId: targetTenantId } : {}),
                role: 'CUSTOMER'
            },
            include: {
                profile: true,
                orders: {
                    include: {
                        orderItems: {
                            include: { product: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!customer) return { success: false, error: "Pelanggan tidak ditemukan" }

        return { success: true, customer }
    } catch (error: any) {
        console.error('Error fetching customer details:', error)
        return { success: false, error: error.message }
    }
}
